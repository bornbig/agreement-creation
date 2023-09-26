import { useEffect, useState } from "react"
import { getDetails } from "../../store/actions/agreement-action"
import { useDispatch, useSelector } from "react-redux";
import { CONTRACT } from "../../config/config";
import { showNotification } from '../../store/actions/notification-action'
import BigNumber from "bignumber.js";
import "./style.css"
import { getUSDQuote } from "../../store/actions/price-discovery";

export function AgreementDetails(props){
    const [ipfsJson, setIpfsJson] = useState({});
    const [decimals, setDecimals] = useState(0);
    const [ticker, setTicker] = useState("");
    const [humanReadableTokenAmount, setHumanReadableTokenAmount] = useState(0);
    const [detailsLoading, setDetailsLoading] = useState(true);
    const [remainingTime, setRemainingTime] = useState(0);
    const { wallet, web3, isConnected, chainId } = useSelector((state) => state.user);

    const dispatch = useDispatch();

    useEffect(() => {
        updateDetails(props.ipfs_hash);
    }, [])

    const updateDetails = async (ipfs_hash) => {
        try {
            if(web3 && props.token){
                const erc20Contract = new web3.eth.Contract(CONTRACT[chainId].tokenAbi, props.token);
                let decimals = await erc20Contract.methods.decimals().call();
                let ticker = await erc20Contract.methods.symbol().call();
                const cryptoAmount = formatNumber((props.price / (10 ** decimals)).toFixed(decimals));
    
                setDecimals(decimals);
                setTicker(ticker);
                setHumanReadableTokenAmount(cryptoAmount);
                getPriceInUSD(cryptoAmount)
                getRemainingTime();
            }

            if(ipfs_hash){
                const ipfsDetails = await getDetails(ipfs_hash);
                setIpfsJson(ipfsDetails);
                setDetailsLoading(false)
            }
            
        } catch (e) {
            dispatch(showNotification("Unable to Get details", dispatch, "danger"));
        }
        
        setDetailsLoading(false)
    }


    const getRemainingTime = async() => {
        const blockNumber = await web3?.eth.getBlockNumber();
        const timestamp = (await web3?.eth.getBlock(blockNumber))?.timestamp;

        const diffTimestamp = (props.deadline - timestamp) / 60;
        let isNegative = diffTimestamp < 0;
        let days = Math.floor(Math.abs(diffTimestamp) / (24 * 60));
        let hours = Math.floor((Math.abs(diffTimestamp) % (24 * 60)) / 60);
        let minutes = Math.floor(Math.abs(diffTimestamp) % 60);

        let timeLeftStr = "";
        if (days > 0) {
            timeLeftStr += `${days} day${days > 1 ? 's' : ''} `;
        }
        if (hours > 0) {
            timeLeftStr += `${hours} hour${hours > 1 ? 's' : ''} `;
        }
        if (minutes > 0) {
            timeLeftStr += `${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
        if (isNegative) {
            timeLeftStr = "Expired";
        }
        // return timeLeftStr;
        setRemainingTime(timeLeftStr);
    }

    const getClient = () => {
        if(props.client && !props.emails?.client)
            return <a target="_blank" rel="noreferrer noopener" href={"https://testnets.opensea.io/" + props.client}><span className="address">{props.client}</span></a>;

        if(props.client_email || props.emails?.client)
            return <span className="address">{props.client_email || props.emails.client}</span>;
    }

    const getServiceProvider = () => {
        if(props.service_provider && !props.emails?.service_provider)
            return <a target="_blank" rel="noreferrer noopener" href={"https://testnets.opensea.io/" + props.service_provider}><span className="address">{props.service_provider}</span></a>;

        if(props.service_provider_email || props.emails?.service_provider)
            return <span className="address">{props.service_provider_email || props.emails.service_provider}</span>;
    }

    const formatNumber = (number) => {
        const parts = number.split('.');
    
        if (parts.length === 2) {
            const integerPart = parts[0];
            let decimalPart = parts[1].replace(/0+$/, '');
    
            if (decimalPart === '') {
                decimalPart = '000';
            }
    
            return `${integerPart}.${decimalPart}`;
        } else {
            return number;
        }
    };

    const getPriceInUSD = async (price) => {
        const usdResponse = await getUSDQuote(price);

        props.setUsdPrice(usdResponse?.response?.fiatAmount);
    }
    
    return (
        <div>
            {detailsLoading
                ? <><div className="lds-ring"><div></div><div></div><div></div><div></div></div></>
                : <>
                {isConnected &&
                    <div className="type">The Agreement is between Client ( {getClient()} ) and Service Provider ( {getServiceProvider()} )</div>
                }
                    <div className="agreement-details">
                        {ipfsJson.details}
                    </div>
                    
                    {isConnected && <div className="agreement-price">~${ props.usdPrice } <span>({ humanReadableTokenAmount } {ticker})</span>
                        {props.status != 105 && wallet?.toLowerCase() == props.client?.toLowerCase() &&
                        <div>Release the funds only when the Service Provider has delivered: <b>{ipfsJson.delivery}</b></div>} <br></br>
                        <div>Time Left: <b>{(remainingTime)}</b></div> 
                        {/* Have to work on */}
                    </div>}
                    
                    {props.showProgressBar && (
                    <div className="wrapper-progressBar">
                        <ul className="progressBar">
                        <li className={props.status >= 100 ? "active" : ""}>Agreement Created</li>
                        <li className={props.status >= 101 ? "active" : ""}>Agreement Signed</li>
                        <li className={props.status >= 105 ? "active" : ""}>Agreement Closed</li>
                        </ul>
                    </div>
                    )}
                </>
            }
        </div>
    )
}