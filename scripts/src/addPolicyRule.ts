import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../utils/execStuff';
import { packageId, TransferPolicyCapId, TransferPolicyId } from '../utils/packageInfo';
dotenv.config();

async function addRule() {
    const { keypair, client } = getExecStuff();
    const tx = new TransactionBlock();
    tx.moveCall({
        target: `${packageId}::royalty_policy::set`,
        arguments: [
            tx.object(TransferPolicyId),
            tx.object(TransferPolicyCapId),
            tx.pure.u16(0)
        ],
        typeArguments: [`${packageId}::minter::NFT`]
    })
    const result = await client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: tx,
    });
    console.log(result.digest);
}

addRule();