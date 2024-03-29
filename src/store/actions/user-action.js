import axios from "axios";
import { API_ENDPOINT } from "../../config/config";

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
  const url = `https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=0xc2132d05d31c914a87c6611c10748aeb04b58e8f&address=${wallet}&tag=latest`
  const balanceResponse = (await axios(url)).data;

  return balanceResponse;
}


export async function submitIdToken(token, wallet) {
  const url = `${API_ENDPOINT}/user/verify`
  const saveDataResponse = (await axios.post(url, {
    token: token,
    wallet: wallet
  })).data;

}

export async function getUserWallet(email) {
  if(email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )){

    const url = `${API_ENDPOINT}/user/user-wallet?email=${email}`
    const userWallet = (await axios(url)).data;

    if(userWallet.wallet){
      return userWallet.wallet
    }else{
      return null;
    }
  }

  return email;
}