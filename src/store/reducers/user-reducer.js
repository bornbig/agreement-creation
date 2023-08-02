import { SET_ON_NETWORK_CHANGE, SET_USER_DATA } from "../actions/user-action";

const initialState = {
    userLoading: false,
    isConnected: false,
    wallet: null,
    chainId: null,
    web3: null
  };
  
export default function (state = initialState, action) {
    switch (action.type) {
        case SET_USER_DATA:
            return {
                ...state,
                isConnected: action.data.web3 ? true : false,
                wallet: action.data?.wallet?.toLowerCase(),
                chainId: action.data.chainId,
                web3: action.data.web3
            }
        case SET_ON_NETWORK_CHANGE:
            return {
                ...state,
                chainId: action.chainId
            }
        default:
            return state;
    }
}