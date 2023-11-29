import axios from "axios";
import { CONTRACT, DEFAULT_NETWORK } from "../../config/config";
import ERC20ABI from "../../data/abi/ERC20.json";
import { getUSDQuote } from "./price-discovery";
import apiRequest from "../../config/api-request";

export const SET_USER = 'SET_USER';
export const SET_USER_DATA = 'SET_USER_DATA';
export function setUserWalletConnection(wallet, chainId, web3, smartAccount, userInfo) {
    return {
      type: SET_USER_DATA,
      data: {
        wallet,
        chainId,
        web3,
        smartAccount,
        userInfo
      }
    };
}

export const SET_WALLET_DISCONNECT = 'SET_WALLET_DISCONNECT';
export function setWalletDisconnect() {
    return {
      type: SET_WALLET_DISCONNECT
    };
}

export async function getUSDTBalance(wallet) {
  const tokenAddress = CONTRACT[DEFAULT_NETWORK].tokens[0].contract;
  const host = DEFAULT_NETWORK == '0x13881' ? 'api-testnet.polygonscan.com' : 'api.polygonscan.com';
  const url = `https://${host}/api?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${wallet}&tag=latest&apikey=5AKV6BEQ79MDKQCB3X8BZ4IVXSQW94KMUZ`
  const balanceResponse = (await axios(url)).data;

  return balanceResponse;
}

export const SET_USER_BALANCE = 'SET_USER_BALANCE';
export async function updateUserBalance(wallet){
  const request = apiRequest.utility.getUSDTBalance(wallet);
  const balanceResponse = (await axios(request)).data

  const humanReadableBalance = balanceResponse.data.balance / (10 ** CONTRACT[DEFAULT_NETWORK].tokens[0].decimals);
  const inDollar = await getUSDQuote(humanReadableBalance);

  return {
    type: SET_USER_BALANCE,
    raw: balanceResponse.data.balance,
    humanReadableBalance: parseFloat(humanReadableBalance || 0).toPrecision(4),
    usdBalance: parseFloat(inDollar || 0).toPrecision(4)
  };
}

export async function sendToken(web3, token, wallet, owner, amount) {
    let contract = new web3.eth.Contract(ERC20ABI, token);
    await contract.methods.transfer(wallet, amount).send({from: owner});

  return true;
}


export async function initiateAccount(message, signature){
  const request = apiRequest.user.initiateAccount(message, signature);
  const response = (await axios(request)).data;

  return response.data;
}

export async function sendEmailCode(email, signature){
  const request = apiRequest.user.sendEmailCode(email, signature);
  const response = (await axios(request)).data;

  return response.data;
}

export async function verifyEmailCode(code, signature){
  const request = apiRequest.user.verifyEmailCode(code, signature);
  const response = (await axios(request)).data;

  return response.data;
}

export async function verifyWeb3Auth(token){
  const request = apiRequest.user.verifyWeb3Auth(token);
  const response = (await axios(request)).data;

  return response.data;
}

