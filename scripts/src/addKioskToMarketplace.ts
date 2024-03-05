import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../utils/execStuff';
import { packageId, Kiosk, KioskOwnerCap } from '../utils/packageInfo';
dotenv.config();

async function AddKioskToMarketplace() {
    const { keypair, client } = getExecStuff();
    let sender = "0xfeb221008ec20b3454f078975558913929007e9cb8dc6f2efa22ac64719032ed";
    const tx = new TransactionBlock();
    tx.moveCall({
        target: `${packageId}::marketplace::add_marketplace_to_kiosk`,
        arguments: [
            tx.object(Kiosk),
            tx.object(KioskOwnerCap),
            tx.pure.u128(10)
        ]
    })
    const result = await client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: tx,
    });
    console.log(result.digest);
}

AddKioskToMarketplace();