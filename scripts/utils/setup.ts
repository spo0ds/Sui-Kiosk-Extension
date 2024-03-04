import { SuiObjectChangePublished } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import getExecStuff from './execStuff';

const { execSync } = require('child_process');

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

const getPackageId = async () => {
    try {
        const { keypair, client } = getExecStuff();
        const account = "0xfeb221008ec20b3454f078975558913929007e9cb8dc6f2efa22ac64719032ed";
        const packagePath = process.cwd();
        const { modules, dependencies } = JSON.parse(
            execSync(`sui move build --dump-bytecode-as-base64 --path ${packagePath}`, {
                encoding: "utf-8",
            })
        );
        const tx = new TransactionBlock();
        const [upgradeCap] = tx.publish({
            modules,
            dependencies,
        });
        tx.transferObjects([upgradeCap], tx.pure(account));
        const result = await client.signAndExecuteTransactionBlock({
            signer: keypair,
            transactionBlock: tx,
            options: {
                showEffects: true,
                showObjectChanges: true,
            }
        });
        console.log(result.digest);
        const digest_ = result.digest;

        const packageId = ((result.objectChanges?.filter(
            (a) => a.type === 'published',
        ) as SuiObjectChangePublished[]) ?? [])[0].packageId.replace(/^(0x)(0+)/, '0x') as string;
        // console.log(`packaged ID : ${packageId}`);
        let Kiosk: any;
        let KioskOwnerCap: any;
        let nftCap: any;
        let TransferPolicyId: any;
        let TransferPolicyCapId: any;
        await sleep(10000);

        if (!digest_) {
            console.log("Digest is not available");
            return { packageId };
        }

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

        for (let i = 0; i < output.length; i++) {
            const item = output[i];
            if (item.type === 'created') {
                if (item.objectType === `0x2::kiosk::KioskOwnerCap`) {
                    KioskOwnerCap = String(item.objectId);
                }
                if (item.objectType === `0x2::kiosk::Kiosk`) {
                    Kiosk = String(item.objectId);
                }
                if (item.objectType === `${packageId}::minter::NftCap`) {
                    nftCap = String(item.objectId);
                }
                if (item.objectType == `0x2::transfer_policy::TransferPolicy<${packageId}::minter::NFT>`) {
                    TransferPolicyId = String(item.objectId);
                }
                if (item.objectType == `0x2::transfer_policy::TransferPolicyCap<${packageId}::minter::NFT>`) {
                    TransferPolicyCapId = String(item.objectId);
                }
            }
        }

        return { packageId, Kiosk, KioskOwnerCap, nftCap, TransferPolicyId, TransferPolicyCapId };
    } catch (error) {
        // Handle potential errors if the promise rejects
        console.error(error);
        return { packageId: '', Kiosk: '', KioskOwnerCap: '', nftCap: '', TransferPolicyId: '', TransferPolicyCapId: '' };
    }
};

// Call the async function and handle the result.
getPackageId()
    .then((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.error(error);
    });

export default getPackageId;