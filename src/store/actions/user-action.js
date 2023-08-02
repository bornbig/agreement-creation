export const SET_USER_DATA = 'SET_USER_DATA';
export function setUserWalletConnection(wallet, chainId, web3) {
    return {
      type: SET_USER_DATA,
      data: {
        wallet,
        chainId,
        web3
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