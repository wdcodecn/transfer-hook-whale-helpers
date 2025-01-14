import * as anchor from "@coral-xyz/anchor";
import * as bs58 from 'bs58';
import "dotenv/config";
import { TransferHookWhale } from "./program/transfer_hook_whale";
import idl from './program/transfer_hook_whale.json';
import { readFile } from "fs/promises";

const kpFile = "/home/wudi/.config/solana/id.json";

(async () => {
    let solanarpc = "https://methodical-cosmological-isle.solana-devnet.quiknode.pro/bbc0e81212733d3c69aea27949b6094bce30dee4";

    // if (!solanarpc) {
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

    const listenerId = program.addEventListener("whaleTransferEvent", async (event, slot) => {
        console.log(`A 🐳 just transfered some tokens!\nWhale address: ${event.whaleAddress.toBase58()}\nAmount: ${event.transferAmount.toNumber() / (10 ** 9)}`);
    })

    console.log(`🫡 Listener starter (listener id: ${listenerId})...`);
})()