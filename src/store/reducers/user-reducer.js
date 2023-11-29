import { SET_USER_BALANCE, SET_USER_DATA, SET_WALLET_DISCONNECT, SET_USER } from "../actions/user-action";

const initialState = {
    userLoading: false,
    isConnected: false,
    token: null,
    wallet: null,
    chainId: null,
    web3: null,
    smartAccount: null,
    userInfo: null,
    user: null,
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
                smartAccount: action.data?.smartAccount,
                userInfo: action.data.userInfo
            }
        case SET_USER:
            return {
                ...state,
                user: action.data
            }
        case SET_WALLET_DISCONNECT:
            return {
                ...initialState
            }
        case SET_USER_BALANCE:
            return {
                ...state,
                balance: {
                    raw: action.raw,
                    humanReadable: action.humanReadableBalance,
                    usdBalance: action.usdBalance
                }
            }
        default:
            return state;
    }
}