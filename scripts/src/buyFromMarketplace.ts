import { TransactionBlock } from '@mysten/sui.js/transactions';
import * as dotenv from 'dotenv';
import getExecStuff from '../utils/execStuff';
import { packageId, Kiosk } from '../utils/packageInfo';
dotenv.config();

async function buyItem() {
    const { keypair, client } = getExecStuff();
    const tx = new TransactionBlock();
    const coin = tx.splitCoins(tx.gas, [tx.pure(1_0_000_000)]);

    tx.moveCall({
        target: `${packageId}::marketplace::buy_item_from_marketplace`,
        arguments: [
            tx.object(Kiosk),
            tx.pure.address("0x648ccc5efe214a4d37cfd99fb330555e1a2d8d59a71ed6a1a170e12cebaf79bc"),// nft
            coin,
            tx.object("0x785868c6289e4ef7963ad64fe7d2626a6f73e7553722416e2086efdb5e32c8ce"),//policy
        ],
        typeArguments: [`0xa43fe801ca50e83ae8f147e5698e4e3b0d6985526df5a719b7b4e031fb0731ff::artist_nft::ArtistNFT`]
    });
    const result = await client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: tx,
    });
    console.log(result.digest);
}

buyItem();