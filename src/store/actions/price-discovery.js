import axios from "axios";

export async function getUSDTQuote(usdPrice){ 
    try {
        if(usdPrice >= 1 && usdPrice < 10000){
            const url = `https://api-stg.transak.com/api/v2/currencies/price?partnerApiKey=a7193b71-7510-4225-9df0-c3e31343577b&fiatCurrency=USD&cryptoCurrency=USDT&isBuyOrSell=BUY&network=polygon&paymentMethod=pm_jwire&fiatAmount=${usdPrice}`;
            const data = (await axios.get(url)).data;
            return data;
        }
        return 0;
    } catch (error) {
        console.log("error at USDTQuote")
    }  
}

export async function getUSDQuote(usdtPrice){
    try {
        if(usdtPrice >= 1 && usdtPrice < 10000){
            const url = `https://api-stg.transak.com/api/v2/currencies/price?partnerApiKey=a7193b71-7510-4225-9df0-c3e31343577b&fiatCurrency=USD&cryptoCurrency=USDT&isBuyOrSell=BUY&network=polygon&paymentMethod=pm_jwire&cryptoAmount=${usdtPrice}`;
            const data = (await axios.get(url)).data; 
            return data; 
        }
        return 0;
    } catch (error) {
        console.log("error at USDQuote")
    }  
}