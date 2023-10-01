import { TRANSAK_API_KEY } from "../../config/config";
import transakSDK from '@transak/transak-sdk';

export default function Transak(props){

    const addFunds = async () => {
        //default Crypto amount is wrong
        let transak = new transakSDK({
            apiKey: 'a7193b71-7510-4225-9df0-c3e31343577b', // (Required)
            environment: 'STAGING', // (Required)
            // apiKey: TRANSAK_API_KEY, // (Required)
            // environment: 'PRODUCTION', // (Required)
            network: 'polygon',
            cryptoCurrencyCode: "USDT",
            productsAvailed: "BUY",
            fiatCurrency: "USD",
            defaultCryptoAmount	: props.amount,
            defaultPaymentMethod: "pm_jwire",
            widgetHeight: "80%",
            walletAddress: props.wallet,
            email: props.email
        });
        
        transak.init();
    }

    return (
        <div onClick={addFunds} className={props.className}>
            {props.children}
        </div>
    )
}