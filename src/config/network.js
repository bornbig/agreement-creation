export const NETWORK = {
    "0x13881": {
        name: "Mumbai",
    },
    // "0xa869": {
    //     name: "Fuji"
    // }
}

let networkList = [];

for(const networkId in NETWORK){
    if (NETWORK.hasOwnProperty(networkId)) {
        networkList.push({
            id: networkId,
            ...NETWORK[networkId]
        })
    }
}

export const NETWORK_LIST = networkList;