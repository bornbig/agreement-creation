import { PaymasterMode } from "@biconomy/paymaster";

// export async function estimateAndExecute(web3, method, wallet){
//     const gasFee = await method.estimateGas({from: wallet});
//     const gasPrice = await web3.eth.getGasPrice();
//     const gasValue = gasFee * gasPrice;
//     const userGasBalance = await web3.eth.getBalance(wallet);

//     if(userGasBalance > gasValue){
//         return await method.send({from: wallet, gas: gasFee, gasPrice});
//     }else{
//         throw "GASFEE_ERROR"
//     }
// }

export async function estimateAndExecute(smartAccount, method, to){
    const data = await method.encodeABI();
    const trx = {
        to,
        data,
        // value: "0x"
    }

    return sendTransaction(smartAccount, [trx]);
}

export async function executeMultipleMethod(smartAccount, methods){
  let trx = [];
  for(let i = 0; i < methods.length; i++){
    const data = await methods[i].method.encodeABI();
    trx.push({
        to: methods[i].to,
        data,
    })
  }

  return sendTransaction(smartAccount, trx);
}


export async function sendTransaction(smartAccount, trx){
    let userOp = await smartAccount.buildUserOp(trx);

    const biconomyPaymaster = smartAccount.paymaster;
    let paymasterServiceData = {
      mode: PaymasterMode.SPONSORED,
      smartAccountInfo: {
        name: 'BICONOMY',
        version: '2.0.0'
      },
      calculateGasLimits: true

    };

    const paymasterAndDataResponse = await biconomyPaymaster.getPaymasterAndData(
        userOp,
        paymasterServiceData
      );

    userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
    console.log(paymasterAndDataResponse);

    userOp.callGasLimit = paymasterAndDataResponse.callGasLimit;
    userOp.verificationGasLimit = paymasterAndDataResponse.verificationGasLimit;
    userOp.preVerificationGas = paymasterAndDataResponse.preVerificationGas;

    const userOpResponse = await smartAccount.sendUserOp(userOp);
    const { receipt } = await userOpResponse.wait(1);
    console.log("Rec", receipt);
    console.log("txHash", receipt.transactionHash);
    return receipt.transactionHash;
}


export async function signMessage(smartAccount, trx){
  let userOp = await smartAccount.buildUserOp([trx]);

  
  const userOpResponse = await smartAccount.sendUserOp(userOp);
  const { receipt } = await userOpResponse.wait(1);
  console.log("Rec", receipt);
  console.log("txHash", receipt.transactionHash);
  return receipt.transactionHash;
}