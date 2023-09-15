import axios from "axios";

export async function getUSDTQuote(usdPrice){ 
    try {

        if(/^(?!0+$|\.+$)(?:10000|\d{1,4}(?:\.\d{1,2})?)$/.test(usdPrice)) {

        const url = `https://api-stg.transak.com/api/v2/currencies/price?partnerApiKey=a7193b71-7510-4225-9df0-c3e31343577b&fiatCurrency=USD&cryptoCurrency=USDT&isBuyOrSell=BUY&network=polygon&paymentMethod=pm_jwire&fiatAmount=${usdPrice}`;
        const data = (await axios.get(url)).data;
        return data;

        }
    } catch (error) {
        console.log("error at USDTQuote")
    }
        
    
}

export async function getUSDQuote(usdtPrice){

    try {
        if(usdtPrice < 10000){
            return null;
        }
        if(/^(?!0+$|\.+$)(?:10000|\d{1,4}(?:\.\d{1,2})?)$/.test(usdtPrice)){
        const url = `https://api-stg.transak.com/api/v2/currencies/price?partnerApiKey=a7193b71-7510-4225-9df0-c3e31343577b&fiatCurrency=USD&cryptoCurrency=USDT&isBuyOrSell=BUY&network=polygon&paymentMethod=pm_jwire&cryptoAmount=${usdtPrice}`;
        const data = (await axios.get(url)).data; 
        return data; 

        }
    } catch (error) {
        console.log("error at USDQuote")
    }
   
}