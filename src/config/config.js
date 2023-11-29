import tokens137 from "./tokens/137.json"
import proofABI from "../data/abi/Proof.json"
import escrowABI from "../data/abi/Escrow.json";
import tokenABI from "../data/abi/ERC20.json";


export const CONTRACT = {
    "0x89" : {
        "sender": {
            "contract": "0x2F10076Ef556bfd434e9637cC25845988D728ef2",
            "abi" : proofABI
        },
        "receiver": {
            "contract": "0xd0C32b51bfc95B27B793F8B7A718EFb51d8c322C",
            "abi" : proofABI
        },
        "escrow": {
            "contract": "0x764BD6DdEF5494480B02723a731262C54a3D5694",
            "abi": escrowABI
        },
        "tokens": tokens137,
        "tokenAbi": tokenABI
    },
}

export const PLATFORM_FEE = 2;
export const API_ENDPOINT = "https://api.woople.io/v1";
export const LIGHTHOSE_API_KEY = "0a97ff49.016a385fb12b4d77b185f05e8109ad36";
export const WEB3AUTH_KEY = "BBr9TrVqhjPWSpGoEMvqoOVT7WdIkddUEtUydRXuCGGATFpcMURVLCyYZHddVUXKpqYiQ-JiwiIjPPvKDr7ZPSY";
export const MORALIS_API_KEY = "CLtJpRFrCkxHvgDcy9mewuod1qG9iIsG3TL8MLdrreCEwtCpUwU79fKxRRbCPBpA";
export const TRANSAK_API_KEY = "295ba884-3204-42e4-8a64-924e080e25de";
export const DEFAULT_NETWORK = "0x89";
export const RPC_URL = "https://polygon-mainnet.g.alchemy.com/v2/ip-A-N0sVOSyjzTrDSODvODdTAzBvK-4";
export const DEFAULT_NETWORK_STRING = (DEFAULT_NETWORK == "0x13881") ? "polygon-mumbai" : "polygon";