const anchor = require('@project-serum/anchor');
const { SYSVAR_RENT_PUBKEY } = require('@solana/web3.js');
const assert = require("assert");

describe('remaining_accounts', () => {

  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();

  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.RemainingAccounts;
  console.log(program);
  it("Initialise state", async () => {
    await program.state.rpc.new(
      {
        accounts: {
          authority: provider.wallet.publicKey,
        },
      });

    const s = await program.state.fetch();
    assert.ok(s.keys.length == 0);
  });

  it("Test remaining accounts", async() => {

    let data = [1, 2, 3, 4, 5];
    let keys = await Promise.all(data.map(async x => {
         const [pubkey, _] = await anchor.web3.PublicKey.findProgramAddress(
           [Buffer.from([x])],
           program.programId
         );
         return { pubkey, isSigner: false, isWritable: false };
    }));

    let key1 = new anchor.web3.Keypair();
    let key2 = new anchor.web3.Keypair();
    let key3 = new anchor.web3.Keypair();

    let testAccount = new anchor.web3.Keypair();

    let createTestAccountTx = anchor.web3.SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: testAccount.publicKey,
      space: 1000,
      lamports: await provider.connection.getMinimumBalanceForRentExemption(
        1000
      ),
      programId: program.programId,
    })

    await program.state.rpc.testRemainingAccounts(
      key1.publicKey,
      key2.publicKey,
      key3.publicKey,
      {
        accounts: {
          authority: provider.wallet.publicKey,
          testAccount: testAccount.publicKey,
          rent: SYSVAR_RENT_PUBKEY,
        },
        remainingAccounts: keys,
        signers: [testAccount],
        instructions: [
          createTestAccountTx
        ],
      },
    );

    const s = await program.state.fetch();
    assert.ok(s.keys.length == 5);
  });
});