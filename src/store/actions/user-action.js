import axios from "axios";
import { API_ENDPOINT, CONTRACT } from "../../config/config";
import ERC20ABI from "../../data/abi/ERC20.json";
import { getUSDQuote } from "./price-discovery";
import Cookies from 'universal-cookie';

const network = '0x13881';

export const SET_USER_DATA = 'SET_USER_DATA';
export function setUserWalletConnection(wallet, chainId, web3, userInfo) {
    return {
      type: SET_USER_DATA,
      data: {
        wallet,
        chainId,
        web3,
        userInfo
      }
    };
}

export const SET_ON_NETWORK_CHANGE = 'SET_ON_NETWORK_CHANGE';
export function setUserNetwork(chainId) {
    return {
      type: SET_ON_NETWORK_CHANGE,
      chainId: chainId
    };
}


export const SET_WALLET_DISCONNECT = 'SET_WALLET_DISCONNECT';
export function setWalletDisconnect() {
    return {
      type: SET_WALLET_DISCONNECT
    };
}

export async function getUSDTBalance(wallet) {
  const tokenAddress = CONTRACT[network].tokens[0].contract;
  const host = network == '0x13881' ? 'api-testnet.polygonscan.com' : 'api.polygonscan.com';
  const url = `https://${host}/api?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${wallet}&tag=latest`
  const balanceResponse = (await axios(url)).data;

  return balanceResponse;
}

export const SET_USER_BALANCE = 'SET_USER_BALANCE';
export async function updateUserBalance(wallet){
  const balanceResponse = await getUSDTBalance(wallet);

  const humanReadableBalance = balanceResponse.result / (10 ** CONTRACT[network].tokens[0].decimals);
  const usdBalance = await getUSDQuote(humanReadableBalance);


  return {
    type: SET_USER_BALANCE,
    raw: balanceResponse.result,
    humanReadableBalance: humanReadableBalance || 0,
    usdBalance: usdBalance?.response?.fiatAmount || 0
  };
}

export async function sendToken(web3, token, wallet, owner, amount) {
    let contract = new web3.eth.Contract(ERC20ABI, token);
    await contract.methods.transfer(wallet, amount).send({from: owner});

  return true;
}


export const SET_USER_TOKEN = 'SET_USER_TOKEN';
export async function submitIdToken(token, wallet) {
  const url = `${API_ENDPOINT}/user/verify`
  const saveDataResponse = (await axios.post(url, {
    token: token,
    wallet: wallet,
  })).data;

  const cookies = new Cookies();
  cookies.set('user_auth_token', `Bearer ${saveDataResponse?.token}`, { path: '*' });

  return {
    token: saveDataResponse?.token
  }
}

export async function getUserWallet(email) {
  if(email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )){

    const cookies = new Cookies();
    const token = cookies.get('user_auth_token');

    const url = `${API_ENDPOINT}/user/user-wallet?email=${email}`
    const userWallet = (await axios(url, {headers: {"Authorization":  token}})).data;

    if(userWallet.wallet){
      return userWallet.wallet
    }else{
      return email;
    }
  }

  return email;
}