import axios from "axios";
import { TRANSAK_API_KEY } from "../../config/config";
import apiRequest from "../../config/api-request";

export async function getUSDTQuote(usdPrice){ 
    try {
        if(usdPrice >= 1 && usdPrice < 10000){
            const url = `https://api.transak.com/api/v2/currencies/price?partnerApiKey=${TRANSAK_API_KEY}&fiatCurrency=USD&cryptoCurrency=USDT&isBuyOrSell=BUY&network=polygon&paymentMethod=pm_jwire&fiatAmount=${usdPrice}`;
            const data = (await axios.get(url)).data;
            return data;
        }
        return 0;
    } catch (error) {
        console.log("error at USDTQuote")
    }  
}

export async function getUSDQuote(amount){
    try {
        if(amount >= 1 && amount < 10000){
            const request = apiRequest.utility.getUSDTConversion(amount)
            const response = (await axios(request)).data;

            return response.data.cryptoAmount;
        }
    } catch (error) {
        console.log("error at USDQuote")
    }  
    return amount - ((2 * amount) / 100);
}