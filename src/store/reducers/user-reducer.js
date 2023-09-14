import { SET_ON_NETWORK_CHANGE, SET_USD_QUOTE, SET_USER_BALANCE, SET_USER_DATA, SET_WALLET_DISCONNECT } from "../actions/user-action";

const initialState = {
    userLoading: false,
    isConnected: false,
    wallet: null,
    chainId: null,
    web3: null,
    userInfo: null,
    balance: {raw: 0, humanReadable: 0, usdBalance: 0},
  };
  
export default function (state = initialState, action) {
    switch (action.type) {
        case SET_USER_DATA:
            return {
                ...state,
                isConnected: action.data.web3 ? true : false,
                wallet: action.data?.wallet,
                chainId: action.data.chainId,
                web3: action.data.web3,
                userInfo: action.data.userInfo
            }
        case SET_ON_NETWORK_CHANGE:
            return {
                ...state,
                chainId: action.chainId
            }
        case SET_WALLET_DISCONNECT:
            return {
                ...initialState
            }
        case SET_USER_BALANCE:
            console.log("changed");
            return {
                ...state,
                balance: {
                    raw: action.balance,
                    humanReadable: action.humanReadableBalance,
                    usdBalance: action.usdBalance
                }
            }
        default:
            return state;
    }
}