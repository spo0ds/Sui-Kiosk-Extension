module kiosk_extension::royalty_policy {
    use sui::sui::SUI;
    use sui::coin::{Self, Coin};
    use sui::tx_context::{Self,TxContext};
    use sui::transfer_policy::{
        Self as policy,
        TransferPolicy,
        TransferPolicyCap,
        TransferRequest
    };
    use kiosk_extension::minter::NFT;
    use sui::package::{Self};

    const EIncorrectArgument: u64 = 0;
    const EInsufficientAmount: u64 = 1;

    const MAX_BPS: u16 = 10_000;

    struct Rule has drop {}

    struct ROYALTY_POLICY has drop{}

    struct Config has store, drop {
        amount_bp: u16
    }

    #[allow(lint(share_owned))]
    fun init(witness: ROYALTY_POLICY, ctx: &mut TxContext) {
        let signer_addr = tx_context::sender(ctx);
        let (policy, policy_cap) = get_policy(witness, ctx);
        sui::transfer::public_transfer(policy_cap, signer_addr);
        sui::transfer::public_share_object(policy);
    }

    public fun get_policy(witness: ROYALTY_POLICY, ctx: &mut TxContext): (TransferPolicy<NFT>, TransferPolicyCap<NFT>) {
        let publisher = package::claim(witness, ctx);
        let (policy, cap) = policy::new(&publisher, ctx); 
        package::burn_publisher(publisher); 
        (policy, cap)
    }
    
    public fun set<T: key + store>(
        policy: &mut TransferPolicy<T>,
        cap: &TransferPolicyCap<T>,
        amount_bp: u16
    ) {
        assert!(amount_bp < MAX_BPS, EIncorrectArgument);
        policy::add_rule(Rule {}, policy, cap, Config { amount_bp })
    }

    public fun pay<T: key + store>(
        policy: &mut TransferPolicy<T>,
        request: &mut TransferRequest<T>,
        payment: &mut Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let config: &Config = policy::get_rule(Rule {}, policy);
        let paid = policy::paid(request);
        let amount = (((paid as u128) * (config.amount_bp as u128) / 10_000) as u64);

        assert!(coin::value(payment) >= amount, EInsufficientAmount);

        let fee = coin::split(payment, amount, ctx);
        policy::add_to_balance(Rule {}, policy, fee);
        policy::add_receipt(Rule {}, request)
    }
}