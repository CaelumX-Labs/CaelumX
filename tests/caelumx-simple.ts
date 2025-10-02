import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Minting } from "../target/types/minting";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { assert } from "chai";

describe("caelumx-simple", () => {
  // Configure the client to use the local validator
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.Minting as Program<Minting>;
  const depositOwner = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array([199, 26, 90, 241, 161, 26, 108, 177, 28, 133, 17, 29, 42, 217, 39, 56, 101, 104, 76, 21, 39, 255, 100, 11, 64, 108, 180, 45, 168, 55, 15, 206, 233, 206, 216, 215, 214, 165, 32, 87, 245, 134, 179, 11, 166, 142, 138, 54, 54, 70, 36, 75, 145, 171, 209, 94, 65, 221, 189, 241, 84, 62, 128, 45])
  );

  const payer = provider.wallet as anchor.Wallet;
  let authorizedVerifier: anchor.web3.Keypair;
  let user: anchor.web3.Keypair;
  let depositAccountPda: anchor.web3.PublicKey;
  let configPda: anchor.web3.PublicKey;

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
    await airdropSOL(payer.publicKey, 10);
    
    // Generate test user
    user = anchor.web3.Keypair.generate();
    authorizedVerifier = depositOwner;
    
    // Airdrop SOL to user
    await airdropSOL(user.publicKey, 5);

    // Find PDAs
    [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    [depositAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("deposit"), user.publicKey.toBuffer()],
      program.programId
    );

    console.log("Config PDA:", configPda.toBase58());
    console.log("Deposit Account PDA:", depositAccountPda.toBase58());
    console.log("User:", user.publicKey.toBase58());
  });

  it("Initializes the Program", async () => {
    try {
      // Check if config already exists
      const existingConfig = await program.account.programConfig.fetch(configPda);
      console.log("Config already exists with verifier:", existingConfig.authorizedVerifier.toBase58());
    } catch (error) {
      // Config doesn't exist, create it
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
    }
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
      .accountsPartial({
        depositAccount: depositAccountPda,
        owner: user.publicKey,
      })
      .signers([user])
      .rpc();

    const depositAccount = await program.account.depositAccount.fetch(depositAccountPda);
    console.log("Credits deposited. Total credits:", depositAccount.totalCredits.toNumber());
    assert.isTrue(depositAccount.totalCredits.toNumber() >= 100);
  });

  it("Verifies Deposit", async () => {
    await program.methods
      .verifyDeposit()
      .accountsPartial({
        depositAccount: depositAccountPda,
        verifier: authorizedVerifier.publicKey,
        config: configPda,
      })
      .signers([authorizedVerifier])
      .rpc();

    const updatedDepositAccount = await program.account.depositAccount.fetch(depositAccountPda);
    console.log("Deposit Account Verified:", updatedDepositAccount.isVerified);
    assert.equal(updatedDepositAccount.isVerified, true);
  });

  it("Validates Program State", async () => {
    // Final validation that all core components are working
    const depositAccount = await program.account.depositAccount.fetch(depositAccountPda);
    const configAccount = await program.account.programConfig.fetch(configPda);
    
    console.log("✅ Final validation:");
    console.log("- Deposit verified:", depositAccount.isVerified);
    console.log("- Total credits:", depositAccount.totalCredits.toNumber());
    console.log("- Authorized verifier:", configAccount.authorizedVerifier.toBase58());
    
    assert.equal(depositAccount.isVerified, true, "Deposit must be verified");
    assert.isTrue(depositAccount.totalCredits.toNumber() > 0, "Must have credits");
    assert.equal(configAccount.authorizedVerifier.toBase58(), authorizedVerifier.publicKey.toBase58(), "Verifier must match");
    
    console.log("✅ All core functionality validated successfully!");
  });
});
