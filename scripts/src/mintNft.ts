import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../utils/execStuff';
import { packageId, nftCap } from '../utils/packageInfo';
dotenv.config();

async function nftMint() {
    const { keypair, client } = getExecStuff();
    const tx = new TransactionBlock();
    tx.moveCall({
        target: `${packageId}::minter::mint`,
        arguments: [
            tx.object(nftCap),
            tx.pure.string("https://demolink.com"),
            tx.pure.address('0xfeb221008ec20b3454f078975558913929007e9cb8dc6f2efa22ac64719032ed')
        ]
    })
    const result = await client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: tx,
    });
    console.log(result.digest);
    const digest_ = result.digest;

    const txn = await client.getTransactionBlock({
        digest: String(digest_),
        // only fetch the effects and objects field
        options: {
            showEffects: true,
            showInput: false,
            showEvents: false,
            showObjectChanges: true,
            showBalanceChanges: false,
        },
    });
    let output: any;
    output = txn.objectChanges;
    let mynft_id;
    for (let i = 0; i < output.length; i++) {
        const item = output[i];
        if (await item.type === 'created') {
            if (await item.objectType === `${packageId}::minter::NFT`) {
                mynft_id = String(item.objectId);
            }
        }
    }
    console.log(`mynft_id: ${mynft_id}`);
}

nftMint();