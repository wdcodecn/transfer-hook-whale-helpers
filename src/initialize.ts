import {readFile} from "fs/promises";
import * as anchor from "@coral-xyz/anchor";
import {TransferHookWhale} from "./program/transfer_hook_whale";
import idl from './program/transfer_hook_whale.json';
// import {createCreateMetadataAccountV3Instruction} from '@metaplex-foundation/mpl-token-metadata'
import {
    createInitializeMetadataPointerInstruction,

    ASSOCIATED_TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    createInitializeInstruction,
    createInitializeMintInstruction,
    createInitializeTransferHookInstruction,
    createMintToInstruction,
    createTransferCheckedWithTransferHookInstruction,
    ExtensionType,
    getAssociatedTokenAddressSync,
    getMintLen,
    TOKEN_2022_PROGRAM_ID,
    transferChecked,
    updateTransferHook, TYPE_SIZE, LENGTH_SIZE, transferCheckedWithTransferHook
} from "@solana/spl-token";
import "dotenv/config";
import {PublicKey, SystemProgram} from "@solana/web3.js";
import {pack, TokenMetadata} from "@solana/spl-token-metadata";

// const kpFile = "./accounts/<your key file>.json";
const kpFile = "/home/wudi/.config/solana/id.json";
const receiver = new anchor.web3.PublicKey("78E5EBTXdHynYgmxrj26VPNj6XauQQenXhyixRtk4wUa")

const main = async () => {
    const token = anchor.web3.Keypair.generate();
    let mint = token.publicKey;

    let solanarpc = "https://methodical-cosmological-isle.solana-devnet.quiknode.pro/bbc0e81212733d3c69aea27949b6094bce30dee4";

    // if (!process.env.SOLANA_RPC) {
    //     console.log("Missing required env variables");
    //     return;
    // }

    console.log("💰 Reading wallet...");
    const keyFile = await readFile(kpFile);
    const payer: anchor.web3.Keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(keyFile.toString())));
    const wallet = new anchor.Wallet(payer);
    const user = payer.publicKey;

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


    // const extensions = [ExtensionType.TransferHook];
    // const mintLen = getMintLen(extensions);
    const metadata: TokenMetadata = {
        mint: mint,
        name: 'TOKEN_NAME',
        symbol: 'SMBL',
        uri: 'URI',
        additionalMetadata: [['new-field', 'new-value']],
    };

    const mintLen = getMintLen([ExtensionType.MetadataPointer,ExtensionType.TransferHook]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

    const {blockhash} = await connection.getLatestBlockhash("confirmed");
    console.log("blockhash", blockhash);


    let ata = getAssociatedTokenAddressSync(mint, user, false, TOKEN_2022_PROGRAM_ID);
    let receiver_ata = getAssociatedTokenAddressSync(mint, receiver, false, TOKEN_2022_PROGRAM_ID);

    const transaction = new anchor.web3.Transaction({
        recentBlockhash: blockhash,  // 设置 recentBlockhash
        feePayer: user,  // 设置交易费用的支付者

    }).add(
        // Allocate the mint account
        SystemProgram.createAccount({
            fromPubkey: user,
            newAccountPubkey: mint,
            space: mintLen,
            lamports: lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        // Initialize the transfer hook extension and point to our program
        createInitializeTransferHookInstruction(
            mint,
            user,
            program.programId, // Transfer Hook Program ID
            TOKEN_2022_PROGRAM_ID,
        ),

        createInitializeMetadataPointerInstruction(mint, payer.publicKey, mint, TOKEN_2022_PROGRAM_ID),

        // Initialize mint instruction
        createInitializeMintInstruction(token.publicKey, 9, user, null, TOKEN_2022_PROGRAM_ID),

        // 添加 metadata
        createInitializeInstruction({
            programId: TOKEN_2022_PROGRAM_ID,
            mint: mint,
            metadata: mint,
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri,
            mintAuthority: payer.publicKey,
            updateAuthority: payer.publicKey,
        }),

        createAssociatedTokenAccountInstruction(user, ata, user, mint, TOKEN_2022_PROGRAM_ID),
        createAssociatedTokenAccountInstruction(user, receiver_ata, receiver, mint, TOKEN_2022_PROGRAM_ID),

        createMintToInstruction(mint, ata, user, BigInt("100000000000000"), [], TOKEN_2022_PROGRAM_ID),

        initializeExtraAccountMetaListInstruction, // 一个token只需要初始化一次
    );

    console.log({
        mint,
        user,
        ata,
        receiver,
        receiver_ata,
        extraAccountMetaListPDA,
        latestWhaleAccount: whalePDA,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })

    const tx = await anchor.web3.sendAndConfirmTransaction(connection, transaction, [token, payer], {
        skipPreflight: true,
        commitment: "confirmed",
    });

    console.log("Transaction Signature:", tx);
    await provider.connection.confirmTransaction(tx, "confirmed");

    // add sleep 3 s
    await new Promise(resolve => setTimeout(resolve, 1000));

    // call
    {

        let tx = await transferCheckedWithTransferHook(connection, payer, ata, mint, receiver_ata, user, BigInt("10000000000000"), 9, [], {
            skipPreflight: true,
            commitment: "confirmed",

        }, TOKEN_2022_PROGRAM_ID);

        console.log("transferCheckedWithTransferHook Transaction Signature:", tx);
    }

    {

        let tx = await updateTransferHook(connection, payer, mint, PublicKey.default, payer,[],{
            skipPreflight:true,
            commitment: "confirmed",

        })
        console.log("updateTransferHook Transaction Signature:", tx);

    }
    {
        // call transfer checked
      let tx =   await transferChecked(connection, payer, ata, mint, receiver_ata, user, BigInt("10000000000000"), 9, [], {
            skipPreflight: true,
            commitment: "confirmed",
        }, TOKEN_2022_PROGRAM_ID)
        console.log("transferChecked Transaction Signature:", tx);

    }


}

main().then(() => {
    console.log("done!");
    process.exit(0);
}).catch((e) => {
    console.log("Error: ", e);
    process.exit(1);
});