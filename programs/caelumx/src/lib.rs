use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::MetadataAccount;
use anchor_lang::system_program;

use anchor_spl::{
    metadata::{
        mpl_token_metadata,
         Metadata,
    },
    token::{Burn,self, Mint, Token, TokenAccount},
};
use mpl_token_metadata::{
    instructions::{
        CreateMasterEditionV3, CreateMasterEditionV3InstructionArgs, CreateMetadataAccountV3,
        CreateMetadataAccountV3InstructionArgs,
    },
    types::{Creator, DataV2},
};

declare_id!("4NwR38YG7r4XuzVGu8ZdYLVW58kuri2qahnyAVVMR7g9");

#[program]
pub mod minting {

    use super::*;
    pub fn initialize_program(
        ctx: Context<InitializeProgram>,
        authorized_verifier: Pubkey,
    ) -> Result<()> {
        // Store the authorized verifier in a global configuration account
        let config = &mut ctx.accounts.config;
        config.authorized_verifier = authorized_verifier;
        Ok(())
    }

    pub fn initialize_deposit_account(
        ctx: Context<InitializeDepositAccount>,
        project_id: String,
        vintage_year: u16,
    ) -> Result<()> {
        // Create a new deposit account associated with the user
        let deposit_account = &mut ctx.accounts.deposit_account;
        deposit_account.owner = ctx.accounts.user.key();
        deposit_account.project_id = project_id.clone();
        deposit_account.vintage_year = vintage_year;
        deposit_account.total_credits = 0;
        deposit_account.is_verified = false;

        Ok(())
    }

    pub fn deposit_credits(ctx: Context<DepositCredits>, quantity: u64) -> Result<()> {
        // Validate deposit
        require!(
            !ctx.accounts.deposit_account.is_verified,
            ErrorCode::AlreadyVerified
        );

        // Update deposit account
        let deposit_account = &mut ctx.accounts.deposit_account;
        deposit_account.total_credits += quantity;

        Ok(())
    }
    pub fn verify_deposit(ctx: Context<VerifyDeposit>) -> Result<()> {
        let deposit_account = &mut ctx.accounts.deposit_account;
        let config = &ctx.accounts.config;

        // Debug prints
        msg!("Verifier public key: {}", ctx.accounts.verifier.key());
        msg!(
            "Authorized verifier from config: {}",
            config.authorized_verifier
        );

        require!(
            ctx.accounts.verifier.key() == config.authorized_verifier,
            ErrorCode::Unauthorized
        );

        deposit_account.is_verified = true;
        Ok(())
    }

    pub fn mint_carbon_credit_nft(
        ctx: Context<MintCarbonCreditNFT>,
        metadata_title: String,
        metadata_symbol: String,
        metadata_uri: String,
        _carbon_credit_amount: u64,
        _project_type: String,
    ) -> Result<()> {
        // Validate deposit account
        require!(
            ctx.accounts.deposit_account.is_verified,
            ErrorCode::DepositNotVerified
        );
        require!(
            ctx.accounts.deposit_account.total_credits > 0,
            ErrorCode::InsufficientCredits
        );

        let deposit_account = &mut ctx.accounts.deposit_account;

        // Mint NFT token (1 token for NFT)
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        
        token::mint_to(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
            1,
        )?;

        // Create Metadata using modern approach
        let creators = vec![Creator {
            address: ctx.accounts.user.key(),
            verified: true,
            share: 100,
        }];

        let metadata_data = DataV2 {
            name: metadata_title,
            symbol: metadata_symbol,
            uri: metadata_uri,
            seller_fee_basis_points: 0,
            creators: Some(creators),
            collection: None,
            uses: None,
        };

        // Create metadata account
        let create_metadata_ix = CreateMetadataAccountV3 {
            metadata: ctx.accounts.metadata_account.key(),
            mint: ctx.accounts.mint.key(),
            mint_authority: ctx.accounts.user.key(),
            payer: ctx.accounts.user.key(),
            update_authority: (ctx.accounts.user.key(), true),
            system_program: ctx.accounts.system_program.key(),
            rent: Some(ctx.accounts.rent.key()),
        };

        let metadata_args = CreateMetadataAccountV3InstructionArgs {
            data: metadata_data,
            is_mutable: true,
            collection_details: None,
        };

        invoke(
            &create_metadata_ix.instruction(metadata_args),
            &[
                ctx.accounts.metadata_account.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.user.to_account_info(),
                ctx.accounts.token_metadata_program.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
        )?;

        // Create Master Edition
        let create_master_edition_ix = CreateMasterEditionV3 {
            edition: ctx.accounts.master_edition.key(),
            mint: ctx.accounts.mint.key(),
            update_authority: ctx.accounts.user.key(),
            mint_authority: ctx.accounts.user.key(),
            payer: ctx.accounts.user.key(),
            metadata: ctx.accounts.metadata_account.key(),
            token_program: ctx.accounts.token_program.key(),
            system_program: ctx.accounts.system_program.key(),
            rent: Some(ctx.accounts.rent.key()),
        };

        let master_edition_args = CreateMasterEditionV3InstructionArgs {
            max_supply: Some(1),
        };

        invoke(
            &create_master_edition_ix.instruction(master_edition_args),
            &[
                ctx.accounts.master_edition.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.user.to_account_info(),
                ctx.accounts.metadata_account.to_account_info(),
                ctx.accounts.token_metadata_program.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
        )?;

        // Reset credits after successful minting
        deposit_account.total_credits = 0;

        Ok(())
    }
    pub fn retire_carbon_credit(ctx: Context<RetireCredit>) -> Result<()> {
        // Burn the NFT token
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(), 
                Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                }
            ), 
            1
        )?;

        // Log retirement event
        msg!("Carbon credit NFT {} retired successfully.", ctx.accounts.mint.key());
        Ok(())
    }
    pub fn list_nft_for_sale(ctx: Context<ListNFT>, price: u64) -> Result<()> {
        // Validate the listing
        require!(price > 0, ErrorCode::InvalidPrice);

        // Create trade account
        let trade = &mut ctx.accounts.trade_account;
        trade.owner = ctx.accounts.seller.key();
        trade.mint = ctx.accounts.mint.key();
        trade.price = price;

        Ok(())
    }
    pub fn buy_nft(ctx: Context<BuyNFT>) -> Result<()> {
        let trade = &ctx.accounts.trade_account;

        // Transfer SOL payment from buyer to seller
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.seller.to_account_info(),
                }
            ),
            trade.price
        )?;

        // Transfer NFT from seller to buyer
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.seller_token_account.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.seller.to_account_info(),
                }
            ),
            1
        )?;

        Ok(())
    }

    pub fn deposit_nft_to_pool(ctx: Context<PoolDepositNFT>) -> Result<()> {
        // Verify the NFT meets pool standards (could add more complex checks)
        require!(
            ctx.accounts.mint.decimals == 0, 
            ErrorCode::InvalidNFTForPool
        );

        // Update pool total credits
        let pool = &mut ctx.accounts.pool_account;
        pool.total_credits += 1; // Each NFT represents 1 credit

        // Burn the deposited NFT
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(), 
                Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.depositor.to_account_info(),
                }
            ), 
            1
        )?;

        // Log pool deposit event
        msg!("NFT deposited to carbon credit pool. Total pool credits: {}", pool.total_credits);
        Ok(())
    }
}

#[account]
pub struct ProgramConfig {
    pub authorized_verifier: Pubkey,
}
#[derive(Accounts)]
pub struct InitializeProgram<'info> {
    #[account(
        init, 
        payer = authority, 
        seeds = [b"config"],  // Ensure this matches client logic
        bump, 
        space = 8 + 32  // Space for pubkey
    )]
    pub config: Account<'info, ProgramConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct InitializeDepositAccount<'info> {
    #[account(
        init, 
        payer = user, 
        space = 8 + 32 + 32 + 8 + 2 + 1,
        seeds = [b"deposit", user.key().as_ref()],
        bump
    )]
    pub deposit_account: Account<'info, DepositAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositCredits<'info> {
    #[account(
        mut, 
        has_one = owner, 
        seeds = [b"deposit", owner.key().as_ref()], 
        bump
    )]
    pub deposit_account: Account<'info, DepositAccount>,
    pub owner: Signer<'info>,
}
#[derive(Accounts)]
pub struct MintCarbonCreditNFT<'info> {
    #[account(
        mut,
        seeds = [b"deposit", user.key().as_ref()],
        bump,
        has_one = owner @ ErrorCode::Unauthorized,
        constraint = deposit_account.is_verified @ ErrorCode::DepositNotVerified
    )]
    pub deposit_account: Account<'info, DepositAccount>,
    
    /// CHECK: Owner matches deposit account - this should be the same as user
    #[account(constraint = owner.key() == user.key() @ ErrorCode::Unauthorized)]
    pub owner: UncheckedAccount<'info>,

    #[account(
        init,
        payer = user,
        mint::decimals = 0,
        mint::authority = user,
        mint::freeze_authority = user,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = user,
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    /// CHECK: Metadata PDA
    #[account(
        mut,
        seeds = [
            b"metadata", 
            token_metadata_program.key().as_ref(), 
            mint.key().as_ref()
        ],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub metadata_account: UncheckedAccount<'info>,

    /// CHECK: Master Edition PDA  
    #[account(
        mut,
        seeds = [
            b"metadata", 
            token_metadata_program.key().as_ref(), 
            mint.key().as_ref(), 
            b"edition"
        ],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub master_edition: UncheckedAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct VerifyDeposit<'info> {
    #[account(
        mut,
        seeds = [b"deposit", deposit_account.owner.as_ref()],
        bump
    )]
    pub deposit_account: Account<'info, DepositAccount>,
    pub verifier: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, ProgramConfig>,
}



#[account]
pub struct DepositAccount {
    pub owner: Pubkey,
    pub project_id: String,
    pub vintage_year: u16,
    pub total_credits: u64,
    pub is_verified: bool,
}

#[account]
pub struct TradeAccount {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub price: u64,
}

#[account]
pub struct CarbonCreditPool {
    pub total_credits: u64,
}
#[derive(Accounts)]
pub struct RetireCredit<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    /// CHECK: Metadata account for the NFT - may not be initialized for simple tokens
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ListNFT<'info> {
    #[account(
        init, 
        payer = seller, 
        space = 8 + 32 + 32 + 8 + 32, // Space for trade account
        seeds = [b"trade", seller.key().as_ref(), mint.key().as_ref()],
        bump
    )]
    pub trade_account: Account<'info, TradeAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub seller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyNFT<'info> {
    #[account(
        mut, 
        seeds = [b"trade", seller.key().as_ref(), mint.key().as_ref()],
        bump,
        close = seller
    )]
    pub trade_account: Account<'info, TradeAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = mint,
        associated_token::authority = buyer
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub seller: Signer<'info>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PoolDepositNFT<'info> {
    #[account(
        init_if_needed,
        payer = depositor,
        seeds = [b"carbon_pool"],
        bump,
        space = 8 + 8 // Space for total credits
    )]
    pub pool_account: Account<'info, CarbonCreditPool>,
    #[account(mut)]
    pub depositor: Signer<'info>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

// Comprehensive Error Code Enum
#[error_code]
pub enum ErrorCode {
    // Verification Errors
    #[msg("Deposit has already been verified")]
    AlreadyVerified,
    #[msg("Deposit is not yet verified")]
    NotVerified,
    #[msg("Deposit is not yet verified")]
    DepositNotVerified,
    #[msg("Unauthorized action")]
    Unauthorized,

    // Credit Errors
    #[msg("Insufficient carbon credits for minting")]
    InsufficientCredits,

    // Account Errors
    #[msg("Invalid bump seed")]
    InvalidBump,
    #[msg("Invalid address")]
    InvalidAddress,

    // Marketplace Errors
    #[msg("Invalid price for NFT listing")]
    InvalidPrice,
    #[msg("NFT does not meet pool deposit standards")]
    InvalidNFTForPool,
}
