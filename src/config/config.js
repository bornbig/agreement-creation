import tokens137 from "./tokens/137.json"
import tokens80001 from "./tokens/80001.json"
import tokens43113 from "./tokens/43113.json";
import proofABI from "../data/abi/Proof.json"
import escrowABI from "../data/abi/Escrow.json";
import tokenABI from "../data/abi/ERC20.json";


export const CONTRACT = {
    "0x13881" : {
        "client": {
            "contract": "0x554F89aCac80C2aB4776Cb4E4ab37725c0A0728f",
            "abi" : proofABI
        },
        "serviceProvider": {
            "contract": "0x2FEf8ccd98D62C4Fa2F04cAD8Fee7a76811b4c95",
            "abi" : proofABI
        },
        "escrow": {
            "contract": "0xbeb3109b7762E0bFc5c83300c4Ef40E7aAD389F8",
            "abi": escrowABI
        },
        "tokens": tokens80001,
        "tokenAbi": tokenABI
    },
    "0x89" : {
        "client": {
            "contract": "0xdb5A33e85Fc502CC39d333bCd9A204DA8D804843",
            "abi" : proofABI
        },
        "serviceProvider": {
            "contract": "0x7561640fD76ECAB53613193EB975a9fC8A695da9",
            "abi" : proofABI
        },
        "escrow": {
            "contract": "0xaFB396A5B6A80EaCf5DCe56a24FF3574430fb498",
            "abi": escrowABI
        },
        "tokens": tokens137,
        "tokenAbi": tokenABI
    },
    "0xa869" : {
        "agreement": {
            "contract": "0x3c1C6AA9f440E5298b7891C911be396F2d82B40E",
            "abi" : proofABI
        },
        "escrow": {
            "contract": "0x9A6B4217867bc2576e45353E7DAdACbF5E5319F6",
            "abi": escrowABI
        },
        "tokens": tokens43113,
        "tokenAbi": tokenABI
    }
}

export const PLATFORM_FEE = 2;
export const API_ENDPOINT = "https://api.woople.io/api";
export const LIGHTHOSE_API_KEY = "0a97ff49.016a385fb12b4d77b185f05e8109ad36";
export const WEB3AUTH_KEY = "BBr9TrVqhjPWSpGoEMvqoOVT7WdIkddUEtUydRXuCGGATFpcMURVLCyYZHddVUXKpqYiQ-JiwiIjPPvKDr7ZPSY";
export const MORALIS_API_KEY = "CLtJpRFrCkxHvgDcy9mewuod1qG9iIsG3TL8MLdrreCEwtCpUwU79fKxRRbCPBpA";
export const TRANSAK_API_KEY = "a7193b71-7510-4225-9df0-c3e31343577b" //"295ba884-3204-42e4-8a64-924e080e25de";
export const DEFAULT_NETWORK = "0x89";
export const DEFAULT_NETWORK_STRING = (DEFAULT_NETWORK == "0x13881") ? "polygon-mumbai" : "polygon";