use anchor_lang::prelude::*;

declare_id!("54Jhpem9ty1uT2Yi8cDuEWJetKwnA1iXrjXQNCsiRRpM");

#[program]
pub mod caelumx {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
