module kiosk_extension::kiosk {
    use sui::kiosk::{Self, Kiosk, KioskOwnerCap};
    use sui::tx_context::{sender, TxContext};
    use sui::object::{ID};
    use sui::coin::{Coin, Self as coin};
    use sui::sui::SUI;
    use kiosk_extension::royalty_policy;
    use sui::transfer_policy::{Self as transfer_policy, TransferPolicy};

    #[allow(lint(share_owned))]
    fun init(ctx: &mut TxContext) {
        let (kiosk, cap) = kiosk::new(ctx);
        sui::transfer::public_transfer(cap, sender(ctx));
        sui::transfer::public_share_object(kiosk);
    }

    public fun place_item<T: key + store>(cap:&KioskOwnerCap, kiosk: &mut Kiosk, item: T){
        kiosk::place(kiosk, cap, item);
    }

    public fun list_item<T: key + store>(cap: &KioskOwnerCap, kiosk: &mut Kiosk, id: ID, price: u64){
        kiosk::list<T>(kiosk, cap, id, price);
    }

    public fun buy_listed_item<T: key + store>(kiosk: &mut Kiosk, id: ID, amount: Coin<SUI>, policy: &mut TransferPolicy<T> ,ctx: &mut TxContext){
        let (nft_id, request) = kiosk::purchase(kiosk, id, amount);
        let zero_amount = coin::zero<0x2::sui::SUI>(ctx);
        royalty_policy::pay(policy, &mut request, &mut zero_amount, ctx);
        transfer_policy::confirm_request(policy, request);
        sui::transfer::public_transfer(nft_id, sender(ctx));
        sui::transfer::public_transfer(zero_amount, sender(ctx));
    }
}