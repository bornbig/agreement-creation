import { useEffect, useState } from "react"
import { getDetails } from "../../store/actions/agreement-action"
import { useSelector } from "react-redux";
import { CONTRACT } from "../../config/config";
import BigNumber from "bignumber.js";

export function AgreementDetails(props){
    const [ipfsJson, setIpfsJson] = useState({});
    const [decimals, setDecimals] = useState(0);
    const [ticker, setTicker] = useState("");
    const [detailsLoading, setDetailsLoading] = useState(false);
    const { wallet, web3, isConnected, chainId } = useSelector((state) => state.user);
    const [timestamp, setTimestam] = useState();

    useEffect(() => {
        updateDetails(props.ipfs_hash);
        if(!timestamp){
            setTymstamp();
        }
    }, [])

    const updateDetails = async (ipfs_hash) => {
        if(web3 && props.token){
            const erc20Contract = new web3.eth.Contract(CONTRACT[chainId].tokenAbi, props.token);
            let decimals = await erc20Contract.methods.decimals().call();
            let ticker = await erc20Contract.methods.symbol().call();

            setDecimals(decimals);
            setTicker(ticker);
        }

        if(ipfs_hash){
            setDetailsLoading(true)
            const ipfsDetails = await getDetails(ipfs_hash);
            setIpfsJson(ipfsDetails);
            setDetailsLoading(false)
        }
    }

    const setTymstamp = async () => {
        const blockNumber = await web3.eth.getBlockNumber();
        const timestamp = (await web3.eth.getBlock(blockNumber)).timestamp;

        setTimestam(timestamp);
    }

    const getRaminingTime = () => {

        const diffTimestamp = (props.deadline - timestamp) / 60;

        console.log(diffTimestamp < 60 * 60);

        if(diffTimestamp < 60){
            return (diffTimestamp.toFixed(2)) + " Minutes";
        }else if(diffTimestamp < 60 * 60){
            return ((diffTimestamp / 60).toFixed(2))  + " Hours";
        }else{
            return ((diffTimestamp / (60 * 24)).toFixed(2)) + " Days";
        }
    }

    return (
        <div>
            {detailsLoading
                ? <><div className="lds-ring"><div></div><div></div><div></div><div></div></div></>
                : <>
                    <div className="type">The Agreement is between Client ( <a target="_blank" href={"https://testnets.opensea.io/" + props.client}><span className="address">{props.client}</span></a>) and Service Provider (<a target="_blank" href={"https://testnets.opensea.io/" + props.service_provider}><span className="address">{props.service_provider}</span></a>)</div>

                    <div className="agreement-details">
                        {ipfsJson.details}
                    </div>
                    
                    <div className="agreement-price">{ (props.price / (10 ** decimals)).toFixed(decimals) } {ticker}
                        {props.status != 105 && wallet == props.client?.toLowerCase() &&
                        <div>Release the funds only whe the Service Provider has deliverd: <b>{ipfsJson.delivery}</b></div>} <br></br>
                        <div>Time Left: <b>{(getRaminingTime())}</b></div>
                    </div>
                    

                    <div className="wrapper-progressBar">
                        <ul className="progressBar">
                            <li className={props.status >= 100 && "active"}>Agreement Created</li>
                            <li className={props.status >= 101 && "active"}>Agreement Signed</li>
                            <li className={props.status >= 105 && "active"}>Agreement Closed</li>
                        </ul>
                    </div>
                </>
            }
        </div>
    )
}