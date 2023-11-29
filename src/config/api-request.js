import { API_ENDPOINT } from "./config"

export default {
    "user": {
        initiateAccount : (message, signature) => {
            return {
                "url" : `${API_ENDPOINT}/user/account/init`,
                "method": "POST",
                "data": {message, signature}
            }
        },
        sendEmailCode : (email, signature) => {
            return {
                "url" : `${API_ENDPOINT}/user/email/generate`,
                "method": "POST",
                "data": {email, signature}
            }
        },
        verifyEmailCode : (code, signature) => {
            return {
                "url" : `${API_ENDPOINT}/user/email/verify`,
                "method": "POST",
                "data": {code, signature}
            }
        },
        verifyWeb3Auth : (token) => {
            return {
                "url" : `${API_ENDPOINT}/user/web3Auth/verify`,
                "method": "POST",
                "data": {token}
            }
        }
    },
    "payment": {
        create: (data) => {
            return {
                "url" : `${API_ENDPOINT}/payment/create`,
                "method": "POST",
                "data": data
            }
        },
        createOnChain: (data) => {
            return {
                "url" : `${API_ENDPOINT}/payment/create/onchain`,
                "method": "POST",
                "data": data
            }
        },
        deleteOffChain: (message, signature, paymentid) => {
            return {
                "url" : `${API_ENDPOINT}/payment/delete`,
                "method": "POST",
                "data": {message, signature, paymentid}
            }
        },
        createOnChain: (data) => {
            return {
                "url" : `${API_ENDPOINT}/payment/create/onchain`,
                "method": "POST",
                "data": data
            }
        },
        list: (user) => {
            return {
                "url" : `${API_ENDPOINT}/payment/list?user=${user}`,
                "method": "GET"
            }
        },
        getSingleById: (agreemenid) => {
            return {
                "url" : `${API_ENDPOINT}/payment/${agreemenid}`,
                "method": "GET"
            }
        },
        getSingleOnChain: (network, contract, id) => {
            return {
                "url" : `${API_ENDPOINT}/payment/${network}/${contract}/${id}`,
                "method": "GET"
            }
        },
    },
    "utility": {
        uploadToIPFS: (content) => {
            return {
                "url" : `${API_ENDPOINT}/utility/ipfs/upload`,
                "method": "POST",
                "data": content
            }
        },
        getIPFSContent: (hash) => {
            return {
                "url" : `${API_ENDPOINT}/utility/ipfs/${hash}`,
                "method": "GET",
            }
        },
        getUSDTBalance: (wallet) => {
            return {
                "url" : `${API_ENDPOINT}/utility/balance/usdt?wallet=${wallet}`,
                "method": "GET",
            }
        },
        getUSDTConversion: (amount) => {
            return {
                "url" : `${API_ENDPOINT}/utility/convert/usdt?amount=${amount}`,
                "method": "GET",
            }
        }
    }
}