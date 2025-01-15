import {Keypair} from "@solana/web3.js";


function findVanityAddress(desiredSuffix:string) {
    let attempt = 0;
    while (true) {
        const keypair = Keypair.generate();
        const pubkey = keypair.publicKey.toString();

        if (pubkey.endsWith(desiredSuffix)) {
            console.log(`成功生成地址: ${pubkey}, 尝试次数: ${attempt}`);
            console.log(`私钥: ${keypair.secretKey.toString()}`);
            break;
        }
        attempt++;
    }
}

findVanityAddress('push');
