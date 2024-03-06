import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../utils/execStuff';
import { Kiosk, TransferPolicyId, packageId } from '../utils/packageInfo';
dotenv.config();

async function placeItem() {
    const { keypair, client } = getExecStuff();
    let sender = "0xfeb221008ec20b3454f078975558913929007e9cb8dc6f2efa22ac64719032ed";
    const tx = new TransactionBlock();
    tx.moveCall({
        target: `${packageId}::marketplace::place_item_in_marketplace`,
        arguments: [
            tx.object(Kiosk),
            tx.object("0xfbf747afb1e168745d12a8425cc62699ec0839653cc0a59372572f97406f260c"),
            tx.object(TransferPolicyId)
        ],
        typeArguments: [`${packageId}::minter::NFT`]
    })
    const result = await client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: tx,
    });
    console.log(result.digest);
}

placeItem();