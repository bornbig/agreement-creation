import tokens137 from "./tokens/137.json"
import tokens80001 from "./tokens/80001.json"
import tokens43113 from "./tokens/43113.json";
import proofABI from "../data/abi/Proof.json"
import escrowABI from "../data/abi/Escrow.json";
import tokenABI from "../data/abi/ERC20.json";

// export const AGREEMENT = "0xA276f40147a8C4d66fc0A63895DfC4d329Aaba1c";
// export const ESCROW = "0x70c86f7df65DeE83406f02fBa2D9FD6520E3d2D0";
// export const TOKEN = "0xfe4f5145f6e09952a5ba9e956ed0c25e3fa4c7f1";

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
            "contract": "0xaBe726AD6f812935476e768D9b949eaF847390a5",
            "abi": escrowABI
        },
        "tokens": tokens80001,
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

export const API_ENDPOINT = "https://profile.pentonium.com/api";
export const LIGHTHOSE_API_KEY = "8449756f.64556c4559ba41e2b00707e597bf8a2b";