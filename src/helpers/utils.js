import { showNotification } from "../store/actions/notification-action";

export async function estimateAndExecute(web3, method, wallet){
    const gasFee = await method.estimateGas();
    const gasPrice = await web3.eth.getGasPrice();
    const gasValue = gasFee * gasPrice;
    const userGasBalance = await web3.eth.getBalance(wallet);

    if(userGasBalance > gasValue){
        return await method.send({from: wallet});
    }else{
        throw "GASFEE_ERROR"
    }
}