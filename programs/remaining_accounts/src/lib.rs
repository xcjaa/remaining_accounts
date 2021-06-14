use anchor_lang::prelude::*;

const SIZE: u64 = 32 * 6 + 24;

#[program]
pub mod remaining_accounts {
    use super::*;

    #[state(SIZE)]
    pub struct MyState {
        pub authority: Pubkey,
        pub keys: Vec<Pubkey>,
    }

    impl MyState {
        pub fn new(ctx: Context<Initialize>) -> Result<Self, ProgramError> {
            Ok(Self {
                authority: *ctx.accounts.authority.key,
                keys: vec![],
            })
        }

        pub fn test_remaining_accounts(
            &mut self,
            ctx: Context<TestRemainingAccounts>,
            key1: Pubkey,
            key2: Pubkey,
            key3: Pubkey,
        ) -> ProgramResult {
            if self.authority != *ctx.accounts.authority.key {
                return Err(ProgramError::Custom(1)); // Arbitrary error.
            }

            ctx.accounts.test_account.authority = *ctx.accounts.authority.key;
            
            let remaining_accounts_iter = &mut ctx.remaining_accounts.iter();
            for _ in 0..ctx.remaining_accounts.len() {
                let account = next_account_info(remaining_accounts_iter)?;
                self.keys.push(*account.key);
            }
            Ok(())
        }
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(signer)]
    pub authority: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct TestRemainingAccounts<'info> {
    #[account(init)]
    pub test_account: ProgramAccount<'info, TestAccount>,
    #[account(signer)]
    pub authority: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct TestAccount {
    pub authority: Pubkey
}

/*#[error]
pub enum ErrorCode {}*/