
const anchor = require("@coral-xyz/anchor");
const { Keypair, PublicKey, SystemProgram } = require("@solana/web3.js");
const dotenv = require("dotenv");
dotenv.config();


(async () => {
  // Configure the provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Load the program
  const program = anchor.workspace.CaelumRegistry;

  // Generate a new registry account keypair
  const registryAccount = Keypair.generate();

  console.log("Registry Account:", registryAccount.publicKey.toBase58());

  // Initialize the registry account
  try {
    await program.methods
      .initializeRegistry()
      .accounts({
        registryAccount: registryAccount.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([registryAccount])
      .rpc();

    console.log("Registry initialized successfully.");
  } catch (error) {
    console.error("Error deploying registry:", error);
  }
})();
