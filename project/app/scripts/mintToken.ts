import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { create } from "ipfs-http-client";

const ipfs = create({ url: "https://ipfs.infura.io:5001/api/v0" });

const mintToken = async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CaelumRegistry;

  // Registry account public key (replace with your actual registry account)
  const registryAccount = new PublicKey("2mg8v3Nxu1yzjjHbhX84jiSkfX2jBZcojTP4hgyNeLGa");

  // Project details
  const projectDetails = {
    name: "Amazon Reforestation",
    type: "Reforestation",
    region: "Brazil",
    vintageYear: 2023,
    certificationBody: "Gold Standard",
    creditAmount: 1000,
  };

  try {
    // Upload metadata to IPFS
    const metadata = JSON.stringify(projectDetails);
    const { cid } = await ipfs.add(metadata);
    const ipfsHash = cid.toString();

    console.log("Metadata uploaded to IPFS:", ipfsHash);

    // Add project to the registry
    await program.methods
      .addProject(
        projectDetails.name,
        projectDetails.type,
        projectDetails.region,
        projectDetails.vintageYear,
        projectDetails.certificationBody,
        projectDetails.creditAmount,
        ipfsHash
      )
      .accounts({
        registryAccount,
        verifier: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Token minted and linked to project metadata.");
  } catch (error) {
    console.error("Error minting token:", error);
  }
};

mintToken();
