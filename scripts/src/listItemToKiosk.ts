import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../utils/execStuff';
import { packageId, Kiosk, KioskOwnerCap } from '../utils/packageInfo';
dotenv.config();

async function listItem() {
    const { keypair, client } = getExecStuff();
    const tx = new TransactionBlock();

    tx.moveCall({
        target: `${packageId}::kiosk::list_item`,
        arguments: [
            tx.object(KioskOwnerCap),
            tx.object(Kiosk),
            tx.pure.address("0xfbf747afb1e168745d12a8425cc62699ec0839653cc0a59372572f97406f260c"),
            tx.pure.u64(1_0_000_000)
        ],
        typeArguments: [`${packageId}::minter::NFT`]
    });

    const result = await client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: tx,
    });

    console.log({ result });
}

listItem();