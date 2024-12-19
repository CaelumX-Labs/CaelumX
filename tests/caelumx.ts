
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Minting } from "../target/types/minting";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../wba-wallet.json";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createInitializeMintInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import * as token from "@solana/spl-token";
import { MPL_TOKEN_METADATA_PROGRAM_ID, createMetadataAccountV3, CreateMetadataAccountV3InstructionAccounts, CreateMetadataAccountV3InstructionArgs, DataV2Args, createNft, mplTokenMetadata, findMetadataPda } from "@metaplex-foundation/mpl-token-metadata";
import { Keypair, SendTransactionError, Transaction } from "@solana/web3.js";
import { assert, config } from "chai";
import { createSignerFromKeypair, Umi, generateSigner, signerIdentity, percentAmount, publicKey } from "@metaplex-foundation/umi";
import base58 from "bs58";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

describe("caelumx", async () => {
  // Configure the client to use the Devnet cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const programId = new anchor.web3.PublicKey("CVfCz15bKrkSi7K1HW8ujd9WsuXJcDQLJ1FFcrP8HYMH");
  
  const program = anchor.workspace.Minting as Program<Minting>;
  const depositOwner = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array([199, 26, 90, 241, 161, 26, 108, 177, 28, 133, 17, 29, 42, 217, 39, 56, 101, 104, 76, 21, 39, 255, 100, 11, 64, 108, 180, 45, 168, 55, 15, 206, 233, 206, 216, 215, 214, 165, 32, 87, 245, 134, 179, 11, 166, 142, 138, 54, 54, 70, 36, 75, 145, 171, 209, 94, 65, 221, 189, 241, 84, 62, 128, 45])
  );
  // Test wallets
  const umi = createUmi('https://api.devnet.solana.com'); // Ensure Umi is also pointing to Devnetx
  const payer = provider.wallet as anchor.Wallet;
  let authorizedVerifier: anchor.web3.Keypair;
  let user = anchor.web3.Keypair.generate(); // Generate a new user Keypair
  let mintKeypair = anchor.web3.Keypair.generate();
  let depositAccountPda: anchor.web3.PublicKey;
  let configPda: anchor.web3.PublicKey;
  let poolPda: anchor.web3.PublicKey;
  let tokenAccount = await token.getAssociatedTokenAddress(mintKeypair.publicKey, user.publicKey);
  const mint = generateSigner(umi);
  const sellerFeeBasisPoints = percentAmount(0, 2);
  let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
  const signer = createSignerFromKeypair(umi, keypair);

const myKeypairSigner = createSignerFromKeypair(umi, keypair);
  umi.use(signerIdentity(myKeypairSigner));
  umi.use(mplTokenMetadata());
  // Utility function to airdrop SOL
  async function airdropSOL(recipient: anchor.web3.PublicKey, amount: number = 10) {
    const airdropSignature = await provider.connection.requestAirdrop(
      recipient, 
      amount * anchor.web3.LAMPORTS_PER_SOL
    );
    
    const latestBlockhash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature: airdropSignature
    });
  }

  before(async () => {
    // Ensure payer has sufficient balance
    await airdropSOL(payer.publicKey, 100);

    // Generate test wallets
    authorizedVerifier = anchor.web3.Keypair.generate();
    user = anchor.web3.Keypair.generate();

    // Airdrop SOL to test wallets
    await airdropSOL(authorizedVerifier.publicKey);
    await airdropSOL(user.publicKey);
    
    // Find PDAs
    [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    [depositAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("deposit")],
      program.programId
    );
    [poolPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("carbon_pool")],
      program.programId
    );
  
    // Airdrop SOL to ensure the payer has enough balance
    await airdropSOL(user.publicKey);
  

    console.log("Pool account initialized at:", poolPda.toBase58());
    // Generate mint keypair
    mintKeypair = anchor.web3.Keypair.generate();
  });

  it("Initializes the Program", async () => {
    await program.methods
      .initializeProgram(authorizedVerifier.publicKey)
      .accountsPartial({
        config: configPda,
        authority: payer.publicKey,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([payer.payer])
      .rpc();

    const configAccount = await program.account.programConfig.fetch(configPda);
    console.log("Config Account Initialized:", configAccount);
  });

  it("Initializes Deposit Account", async () => {
    await program.methods
      .initializeDepositAccount("project-id", 2024)
      .accountsPartial({
        depositAccount: depositAccountPda,
        user: user.publicKey,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const depositAccount = await program.account.depositAccount.fetch(depositAccountPda);
    console.log("Deposit Account Initialized:", depositAccount);
  });

  it("Deposit Credits", async () => {
    await program.methods
      .depositCredits(new anchor.BN(100))
      .accounts({
        depositAccount: depositAccountPda,
        owner: user.publicKey,
      })
      .signers([user])
      .rpc({ skipPreflight: true });

    const depositAccount = await program.account.depositAccount.fetch(depositAccountPda);
    assert.equal(depositAccount.totalCredits.toNumber(), 100);
  });

  it("Verifies Deposit", async () => {
    await program.methods
      .verifyDeposit()
      .accounts({
        depositAccount: depositAccountPda,
        verifier: authorizedVerifier.publicKey,
        config: configPda,
      })
      .signers([authorizedVerifier])
      .rpc();

      const depositAccount = await program.account.depositAccount.fetch(depositAccountPda);
      console.log("Deposit Account Verified:", depositAccount.isVerified);
    
      // Add a check for verification
      if (!depositAccount.isVerified) {
        throw new Error('Deposit not verified');
      }
  });

const name = "Carbon Credit NFT";
const uri = "https://example.com/metadata.json";  
const symbol = "CARBON";
it("Mint Carbon Credit NFT after setup", async () => {
  const user = anchor.web3.Keypair.generate(); // Generate a new user Keypair
  const mintKeypair = anchor.web3.Keypair.generate();
  
  console.log("Deposit Account Owner Public Key:", depositOwner.publicKey.toBase58());
  console.log("User Public Key:", user.publicKey.toBase58());
  console.log("Mint Public Key:", mintKeypair.publicKey.toBase58());
  
  const fetchedDepositAccount = await program.account.depositAccount.fetch(depositAccountPda);
  console.log("Deposit Account Owner Public Key:", fetchedDepositAccount.owner.toBase58());

  // Ensure deposit is verified first
  await program.methods
    .verifyDeposit()
    .accounts({
      depositAccount: depositAccountPda,
      verifier: authorizedVerifier.publicKey,
      config: configPda,
    })
    .signers([authorizedVerifier])
    .rpc();

  // Derive associated token account explicitly
  const tokenAccount = await token.getAssociatedTokenAddress(
    mintKeypair.publicKey,
    user.publicKey
  );
  console.log("Token Account:", tokenAccount.toBase58());

  // Confirm verification
  const depositAccount = await program.account.depositAccount.fetch(depositAccountPda);
  console.log("Deposit Verification Status:", depositAccount.isVerified);

  // Ensure rent exemption and airdrop SOL if necessary
  const rentExemptBalance = await provider.connection.getMinimumBalanceForRentExemption(token.MINT_SIZE);
  const userBalance = await provider.connection.getBalance(user.publicKey);
  console.log("User Balance:", userBalance);

  if (userBalance < rentExemptBalance) {
    await airdropSOL(user.publicKey, 5); // Airdrop more SOL if needed
  }

  // 1. Use Umi to mint the NFT
  const tx = createNft(umi, {
    mint,
    name,
    symbol,
    uri,
    sellerFeeBasisPoints,
  });

  // 2. Send and confirm transaction
  const result = await tx.sendAndConfirm(umi);
  const signature = base58.encode(result.signature);

  console.log(`Successfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);
  console.log("Mint Address:", mint.publicKey);
  
  // Optional: Log the mint address and signature for further validation
  console.log("Mint Public Key:", mint.publicKey);
  console.log("Transaction Signature:", signature);
});
// describe("Retire Carbon Credit", () => {
// it("should allow retiring a carbon credit NFT", async () => {
//   // Mint NFT and create metadata
//   await mintNFTWithMetadata();

//   await program.methods
//     .retireCarbonCredit()
//     .accounts({
//       mint: mintKeypair.publicKey,
//       tokenAccount: tokenAccount,
//       owner: user.publicKey,
//       tokenProgram: TOKEN_PROGRAM_ID,
//     })
//     .signers([user])
//     .rpc();

//   // Verify NFT is burned
//   try {
//     await token.getMint(provider.connection, mintKeypair.publicKey);
//     assert.fail("Mint should have been burned");
//   } catch (err) {
//     assert.include(err.message, "could not find mint");
//   }
// });
// });
// it("NFT Trading", async () => {
//   // Regenerate mint and token account for each test
//   mintKeypair = anchor.web3.Keypair.generate();

//   try {
//     // Create the mint with 0 decimals (NFT-like)
//     await token.createMint(
//       provider.connection, 
//       user, 
//       user.publicKey, 
//       user.publicKey, 
//       0, 
//       mintKeypair
//     );

//     // Create Associated Token Account
//     tokenAccount = await token.createAssociatedTokenAccount(
//       provider.connection,
//       user,
//       mintKeypair.publicKey,
//       user.publicKey
//     );

//     // Mint 1 token to the token account
//     await token.mintTo(
//       provider.connection,
//       user,
//       mintKeypair.publicKey,
//       tokenAccount,
//       user.publicKey,
//       1
//     );

//     // Ensure the mint authority is correctly set up
//     const mintInfo = await token.getMint(
//       provider.connection, 
//       mintKeypair.publicKey
//     );

//     // Create Metadata for the NFT
//     // const metadataAccount = findMetadataPda(umi, {
//     //   mint: mintKeypair.publicKey
//     // })[0];
 
//     let mint = publicKey("CAVpqoZZvnKF55Fnr2GidJwqvm1CWuFy8iF7CSUsiVMj")
//     const metadataPda = anchor.web3.PublicKey.findProgramAddressSync(
//       [
//           Buffer.from("metadata"),
//           Uint8Array.from(MPL_TOKEN_METADATA_PROGRAM_ID.toBytes()), // Force conversion
//           Uint8Array.from(mintKeypair.publicKey.toBytes()) // Force conversion
//       ],
//       MPL_TOKEN_METADATA_PROGRAM_ID
//   );
//   console.log("Metadata PDA:", metadataPda[0].toBase58());
  
//     let accounts: CreateMetadataAccountV3InstructionAccounts = {
//       mint,
//       mintAuthority: signer
//   }

//     let data: DataV2Args = {
//       name: "My NFT",
//       symbol: "NFT",
//       uri: "",
//       sellerFeeBasisPoints: 0,
//       creators: null,
//       collection: null,
//       uses: null
//   }
//     let args: CreateMetadataAccountV3InstructionArgs = {
//       data: data,
//       isMutable: true,
//       collectionDetails: null
//   }
//         let tx = createMetadataAccountV3(
//             umi,
//             {
//                 ...accounts,
//                 ...args
//             }
//         )
//     // Add error handling for transaction
//     try {
//       const txSig = await tx.sendAndConfirm(umi);
//       console.log("Metadata creation transaction signature:", txSig);
//     } catch (error) {
//       console.error("Error creating metadata:", error);
      
//       // If there's a SendTransactionError, get detailed logs
//       if (error instanceof SendTransactionError) {
//         const logs = error.getLogs(provider.connection);
//         console.error("Transaction Logs:", logs);
//       }
      
//       throw error; // Re-throw to fail the test
//     }
//   } catch (error) {
//     console.error("Test setup failed:", error);
//     throw error;
//   }
// });
// it("should allow listing an NFT for sale", async () => {
//   // Regenerate mint and token account for the test
//   const mintKeypair = anchor.web3.Keypair.generate();

//   // Create the mint with 0 decimals
//   await token.createMint(
//     provider.connection,
//     user,
//     user.publicKey, // Mint authority
//     user.publicKey, // Freeze authority
//     0,              // Decimals for NFT
//     mintKeypair     // The mint's keypair
//   );

//   // Create an associated token account for the user
//   const tokenAccount = await token.createAssociatedTokenAccount(
//     provider.connection,
//     user,
//     mintKeypair.publicKey,
//     user.publicKey
//   );

//   // Mint 1 token (NFT) to the token account
//   await token.mintTo(
//     provider.connection,
//     user,
//     mintKeypair.publicKey,
//     tokenAccount,
//     user.publicKey,
//     1 // Amount to mint (1 for NFT)
//   );

//   // Use Umi to upload metadata and create metadata account
//   const metadata = {
//     name: "Trade Carbon Credit",
//     symbol: "TRADE",
//     uri: "https://example.com/trade-metadata.json",
//     sellerFeeBasisPoints: 500, // 5% royalty
//     creators: null,
//     collection: null,
//     uses: null,
//   };

//   // Upload metadata using Umi (if needed)
//   const metadataUri = await umi.uploader.uploadJson(metadata);
//   console.log("Uploaded metadata URI:", metadataUri);
//   const metadataPda = anchor.web3.PublicKey.findProgramAddressSync(
//     [
//       Buffer.from("metadata"),
//       MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
//       mintKeypair.publicKey.toBuffer(),
//     ],
//     new anchor.web3.PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID)
//   );console.log("Metadata PDA:", metadataPda[0].toBase58());

//   const createMetadataIx = createMetadataAccountV3(umi, {
//     metadata: metadataPda[0],
//     mint: mintKeypair.publicKey,
//     mintAuthority: createSignerFromKeypair(umi, user),
//     payer: user.publicKey,
//     updateAuthority: user.publicKey,
//     data: metadata,
//     isMutable: true,
//     collectionDetails: null,
//   });

//   const tx = new anchor.web3.Transaction().add(createMetadataIx.build());
//   tx.feePayer = provider.wallet.publicKey;
//   await provider.sendAndConfirm(tx, [user]);

//   // Prepare trade account PDA
//   const [tradeAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
//     [
//       Buffer.from("trade"),
//       user.publicKey.toBuffer(),
//       mintKeypair.publicKey.toBuffer(),
//     ],
//     program.programId
//   );

//   // Set listing price
//   const listingPrice = new anchor.BN(1_000_000); // 1 SOL

//   // List NFT for sale
//   await program.methods
//     .listNftForSale(listingPrice)
//     .accounts({
//       tradeAccount: tradeAccountPda,
//       mint: mintKeypair.publicKey,
//       tokenAccount: tokenAccount,
//       seller: user.publicKey,
//       systemProgram: anchor.web3.SystemProgram.programId,
//     })
//     .signers([user])
//     .rpc();

//   // Fetch and verify the trade account
//   const tradeAccount = await program.account.tradeAccount.fetch(tradeAccountPda);
//   assert.equal(tradeAccount.price.toString(), listingPrice.toString());
//   assert.deepEqual(tradeAccount.owner.toBase58(), user.publicKey.toBase58());
// });



// it("should prevent listing with zero price", async () => {
//   const [tradeAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
//     [
//       Buffer.from("trade"),
//       user.publicKey.toBuffer(),
//       mintKeypair.publicKey.toBuffer()
//     ],
//     program.programId
//   );

//   try {
//     await program.methods
//       .listNftForSale(new anchor.BN(0))
//       .accounts({
//         tradeAccount: tradeAccountPda,
//         mint: mintKeypair.publicKey,
//         tokenAccount: tokenAccount,
//         seller: user.publicKey,
//         systemProgram: anchor.web3.SystemProgram.programId,
//       })
//       .signers([user, mintKeypair])
//       .rpc();
    
//     assert.fail("Should have thrown an error");
//   } catch (err) {
//     assert.include(err.toString(), "InvalidPrice");
//   }
// });

// it("should allow depositing NFT to carbon credit pool", async () => {
//   // Find pool PDA
//   const [poolPda] = anchor.web3.PublicKey.findProgramAddressSync(
//     [Buffer.from("carbon_pool")],
//     program.programId
//   );

//   // Create a new mint for the pool deposit
//   const poolMintKeypair = anchor.web3.Keypair.generate();

//   // Create the mint with 0 decimals (NFT-like)
//   await token.createMint(
//     provider.connection, 
//     user, 
//     user.publicKey, 
//     user.publicKey, 
//     0, 
//     poolMintKeypair
//   );

//   // Create Associated Token Account
//   const poolTokenAccount = await token.createAssociatedTokenAccount(
//     provider.connection,
//     user,
//     poolMintKeypair.publicKey,
//     user.publicKey
//   );

//   // Mint 1 token to the token account
//   await token.mintTo(
//     provider.connection,
//     user,
//     poolMintKeypair.publicKey,
//     poolTokenAccount,
//     user.publicKey,
//     1
//   );

//   // Create Metadata for the NFT
//   const createPoolMetadataIx = createMetadataAccountV3(umi, {
//     mint: poolMintKeypair.publicKey,
//     mintAuthority: signer,
//     data: {
//       name: "Pool Carbon Credit",
//       symbol: "POOL",
//       uri: "https://example.com/pool-metadata.json",
//       sellerFeeBasisPoints: 0,
//       creators: null,
//       collection: null,
//       uses: null
//     },
//     isMutable: true,
//     collectionDetails: null
//   });

//   await createPoolMetadataIx.sendAndConfirm(umi);

//   // Deposit NFT to pool
//   await program.methods
//     .depositNftToPool()
//     .accounts({
//       poolAccount: poolPda,
//       depositor: user.publicKey,
//       mint: poolMintKeypair.publicKey,
//       tokenAccount: poolTokenAccount,
//       tokenProgram: token.TOKEN_PROGRAM_ID,
//       systemProgram: anchor.web3.SystemProgram.programId,
//     })
//     .signers([user])
//     .rpc();

//   // Fetch and verify pool account
//   const poolAccount = await program.account.carbonCreditPool.fetch(poolPda);
//   assert.equal(poolAccount.totalCredits.toString(), "1");

//   // Verify NFT is burned
//   try {
//     await token.getMint(provider.connection, poolMintKeypair.publicKey);
//     assert.fail("Mint should have been burned");
//   } catch (err) {
//     assert.include(err.message, "could not find mint");
//   }
// });
});