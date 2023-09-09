import BigNumber from "bignumber.js";
import { useState } from "react";
import { getUSDTQuote } from "../../store/actions/price-discovery";
import { PLATFORM_FEE } from "../../config/config";
import { useDispatch } from "react-redux";
import { showNotification } from "../../store/actions/notification-action";

export function Price(props){
    const dispatch = useDispatch();
    const { decimals, ticker } = props.selectedToken;
    const bnDecimals = new BigNumber(100).pow(new BigNumber(decimals));
    const [quote, setQuote] = useState({});

    const formatPrice = (price) => {

        let regexp = /^[0-9.]+$/;

        if(regexp.test(price)){
            props.setViewPrice(price)
            props.setPrice(new BigNumber(price).mul(bnDecimals).toString());
        }else if(price == ""){
            props.setViewPrice("")
            props.setPrice(0);
        }
    }

    const updateFiat = async (usdPrice) => {
        try {
            let regexp = /^[0-9.]+$/;
    
            if(regexp.test(usdPrice)){
                props.setViewPrice(usdPrice);
                updateUsdtPrice(usdPrice);
            }else if(usdPrice == ""){
                props.setViewPrice("")
                props.setPrice(0);
            }
            
        } catch (e) {
            console.log("Entered wrong price")
        }
    }

    function checkPriceInput(viewPrice) {
        if(viewPrice > 10000){
            dispatch(showNotification("Please place an order of less than 10000", dispatch))
        }
        return ((viewPrice == 0 || viewPrice == '.' || !viewPrice || viewPrice == "") ? " disabled" : "");
      }
      

    const updateUsdtPrice = async (usdPrice) => {
        try {
            const usdtReposnse = await getUSDTQuote(usdPrice , dispatch);
            setQuote(usdtReposnse.response);
            props.setPrice(new BigNumber(usdtReposnse.response.cryptoAmount).mul(bnDecimals).toString());
            
        } catch (e) {
            console.log(e + "Entered wrong price")
        }
    }

    const BillingAmount = (price) => {
        try {

            const reducedPrice = price - (price * (PLATFORM_FEE / 100));
            const formattedPrice = (reducedPrice / bnDecimals).toFixed(2)


        return formattedPrice;
        } catch (e) {
            console.log(e)
        }
        
    }

    return (
        <>
            <div className="contract-creation">
                <div className="question">
                    Please enter the amount of compensation decided.
                </div>
                <div className="note">( Ex: $320 )</div>

                {/* <div className="price-box">
                    <input type="text" onChange={(e) => formatPrice(e.target.value)} value={props.viewPrice} />
                    <div className="token-drop-down">
                        <div className="selected-token">{ticker} <i className="arrow down"></i></div>
                        <div className="drop-down-list">
                            {props.tokens.map((token, index) => (
                                <div className="item selected" onClick={() => props.setSelectedToken(token)}>{token.ticker}</div>
                            ))}
                        </div>
                    </div>
                </div> */}

                
                

                <div className="price-box">
                    <div className="dollar">$</div>
                    <input type="text" className="fiat-text" onChange={(e) => updateFiat(e.target.value)} value={props.viewPrice} />
                </div>
                {props.userType == 1 && 
                <>
                {checkPriceInput(props.viewPrice) !== " disabled" && <div className="note success no-margin">
                <p className="heading-success no-margin">Client will be charged for</p>
                <p className="text-success no-margin">{props.price && (props.price /bnDecimals).toFixed(2) + " USDT"}</p>
                </div>}
                {checkPriceInput(props.viewPrice) !== " disabled" && <div className="note success no-margin">
                <p className="heading-success no-margin">Fee </p>
                <p className="text-success no-margin">{PLATFORM_FEE + "%"}</p>
                </div>}
                {checkPriceInput(props.viewPrice) !== " disabled" && <div className="note success no-margin">
                <p className="heading-success no-margin"><hr className="line"/>You will get </p>
                <p className="text-success no-margin"><hr className="line"/>{BillingAmount(props.price) + " USDT"}</p>
                </div>}
                </>}

                <div className="btn bottom-left" onClick={() => props.nextStep(props.step - 1)}>Previous</div>
                {props.userType == 1 
                    && <div className={"btn bottom-right " + checkPriceInput(props.viewPrice)} onClick={() => props.nextStep(props.step + 1)}>Next</div>
                }{props.userType == 2 &&  (
                        props.allowance < props.price && 
                            <div className={"btn bottom-right " + checkPriceInput(props.viewPrice)} onClick={() => props.approveTokens()}>
                                {props.nextLoading && <div className="loading"><div className="bar"></div></div>}
                                Approve Tokens
                              </div>)
                           ( props.allowance == props.price &&  <div className={"btn bottom-right " + (!props.viewPrice && " disabled")} onClick={() => !props.nextLoading && props.sign()}>
                                {props.nextLoading && <div className="loading"><div className="bar"></div></div>}
                                Sign
                            </div>
                    )
                }
            </div> 
        </>
    )
}