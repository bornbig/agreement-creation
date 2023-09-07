import axios from "axios";

export async function getUSDTQuote(usdPrice){
    const url = `https://api-stg.transak.com/api/v2/currencies/price?partnerApiKey=a7193b71-7510-4225-9df0-c3e31343577b&fiatCurrency=USD&cryptoCurrency=USDT&isBuyOrSell=BUY&network=polygon&paymentMethod=pm_jwire&fiatAmount=${usdPrice}`;
    
    try {

        const data = (await axios.get(url)).data;
        return data;
        
    } catch (error) {
        console.log(error.message)
    }
        
    
}

export async function getUSDQuote(usdtPrice){
    const url = `https://api-stg.transak.com/api/v2/currencies/price?partnerApiKey=a7193b71-7510-4225-9df0-c3e31343577b&fiatCurrency=USD&cryptoCurrency=USDT&isBuyOrSell=BUY&network=polygon&paymentMethod=pm_jwire&cryptoAmount=${usdtPrice}`;

    try {
    
        const data = (await axios.get(url)).data; 
        return data;   
        
    } catch (error) {
        console.log(error.message)
    }
   
}