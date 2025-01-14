import { readFile } from "fs/promises";
import * as anchor from "@coral-xyz/anchor";
import { TransferHookWhale } from "./program/transfer_hook_whale";
import idl from './program/transfer_hook_whale.json';
import { TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import "dotenv/config";

// const kpFile = "./accounts/<your key file>.json";
const kpFile = "/home/wudi/.config/solana/id.json";
const mint = new anchor.web3.PublicKey("6cLo5dY3Ts6PxX7C6rHrFhDMAjDEBFAh6NHQ2jGGPPGr")

const main = async () => {
    let solanarpc = "https://methodical-cosmological-isle.solana-devnet.quiknode.pro/bbc0e81212733d3c69aea27949b6094bce30dee4";

    // if (!process.env.SOLANA_RPC) {
    //     console.log("Missing required env variables");
    //     return;
    // }

    console.log("💰 Reading wallet...");
    const keyFile = await readFile(kpFile);
    const keypair: anchor.web3.Keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(keyFile.toString())));
    const wallet = new anchor.Wallet(keypair);

    console.log("☕️ Setting provider and program...");
    const connection = new anchor.web3.Connection(solanarpc);
    const provider = new anchor.AnchorProvider(connection, wallet, {});
    anchor.setProvider(provider);
    const program = new anchor.Program<TransferHookWhale>(idl as TransferHookWhale, provider);

    console.log(program.programId);

    console.log("🪝 Initializing transfer hook accounts");
    const [extraAccountMetaListPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("extra-account-metas"), mint.toBuffer()],
        program.programId
    );

    const [whalePDA] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("whale_account")], program.programId);

    const initializeExtraAccountMetaListInstruction = await program.methods
        .initializeExtraAccount()
        .accounts({
            mint,
            extraAccountMetaList: extraAccountMetaListPDA,
            latestWhaleAccount: whalePDA,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .instruction();

    const transaction = new anchor.web3.Transaction().add(initializeExtraAccountMetaListInstruction);

    const tx = await anchor.web3.sendAndConfirmTransaction(connection, transaction, [wallet.payer], {
        commitment: "confirmed",
    });

    console.log("Transaction Signature:", tx);
}

main().then(() => {
    console.log("done!");
    process.exit(0);
}).catch((e) => {
    console.log("Error: ", e);
    process.exit(1);
});