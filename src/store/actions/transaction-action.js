import Web3 from "web3";

const transferABI = [
    {
      "indexed": true,
      "internalType": "address",
      "name": "from",
      "type": "address"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "to",
      "type": "address"
    },
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }
  ];

const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
};

export async function submitTransaction(transactionHash, callback){
    console.log("Polling on transaction..", transactionHash);
    const web3 = new Web3("wss://polygon-mainnet.g.alchemy.com/v2/ip-A-N0sVOSyjzTrDSODvODdTAzBvK-4");
    const { logs, status } = await web3.eth.getTransactionReceipt(transactionHash);

    if(status){
    
        for(let i = 0; i < logs.length; i++){
            const {topics, data} = logs[i];

            if(topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"){
                topics.shift()
                const nftTransfer = web3.eth.abi.decodeLog(transferABI, data, topics)
                return nftTransfer;
            }
        }
    }else{
        await delay(2000);
        return await submitTransaction(transactionHash, callback);
    }
}