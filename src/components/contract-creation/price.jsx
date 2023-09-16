import BigNumber from "bignumber.js";
import { useState } from "react";
import { getUSDTQuote } from "../../store/actions/price-discovery";
import { PLATFORM_FEE } from "../../config/config";
import { useDispatch } from "react-redux";
import { showNotification } from "../../store/actions/notification-action";

export function Price(props){
    const dispatch = useDispatch();
    const { decimals, ticker } = props.selectedToken;
    const bnDecimals = new BigNumber(10).pow(new BigNumber(decimals));

    // const formatPrice = (price) => {

    //     let regexp = /^[0-9.]+$/;

    //     if(regexp.test(price)){
    //         props.setViewPrice(price)
    //         props.setPrice(new BigNumber(price).mul(bnDecimals).toString());
    //     }else if(price == ""){
    //         props.setViewPrice("")
    //         props.setPrice(0);
    //     }
    // }

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

        const numberPattern = /^\d+(\.\d{1,5})?$/;
    
        if (!viewPrice || viewPrice == 0) {

            return " disabled";
        }
    
        if (!numberPattern.test(viewPrice)) {

            dispatch(showNotification("Please enter a valid price", dispatch));
            return " disabled";
        }
    
        // if (parseFloat(viewPrice) > 10000) {
            
        //     dispatch(showNotification("Please place an order of less than 10000", dispatch));
        //     return " disabled";
        // }
    
        // return "";
    }
    

    const updateUsdtPrice = async (usdPrice) => {
        try {
            const usdtReposnse = await getUSDTQuote(usdPrice , dispatch);

            if(usdtReposnse){
                props.setPrice(new BigNumber(usdtReposnse.response.cryptoAmount).mul(bnDecimals).toString());
            }else{
                props.setPrice(new BigNumber(usdPrice).mul(bnDecimals).toString());
            }
            
        } catch (e) {
            console.log("Something went wrong")
        }
    }

    const BillingAmount = (price) => {
        try {

            const reducedPrice = price - (price * (PLATFORM_FEE / 100));
            const formattedPrice = (reducedPrice / bnDecimals)
            if(formattedPrice >= 0.01){
                return formattedPrice.toFixed(2) + " USDT";
            }else{
                return formattedPrice + " USDT";
            }
        } catch (e) {
            console.log(e)
        }
        
    }

    const usdtPrice = (price) => {
        const usdt = price / bnDecimals
        if (usdt >= 0.01) {
            return usdt.toFixed(2) + " USDT";
        } else {
            return usdt + " USDT";
        }
    }

    return (
        <>
            <div className="contract-creation">
                <div className="question">
                    Please enter the amount of compensation decided.
                </div>
                <div className="note">( Ex: $320 )</div>

                <div className="price-box">
                    <div className="dollar">$</div>
                    <input type="text" className="fiat-text" onChange={(e) => updateFiat(e.target.value)} value={props.viewPrice} autoFocus/>
                </div>
                {props.userType == 1 && checkPriceInput(props.viewPrice) !== " disabled" && 
                    <>
                        {<div className="note success text-margin">
                            <p className="heading-success text-margin">Client will be charged for</p>
                            <p className="text-success text-margin">{props.price && usdtPrice(props.price)}</p>
                        </div>}
                        {<div className="note success text-margin">
                            <p className="heading-success text-margin">Fee </p>
                            <p className="text-success text-margin">{props.price && PLATFORM_FEE + "%"}</p>
                        </div>}
                        {<div className="note success text-margin">
                            <p className="heading-success text-margin"><hr className="line"/>You will get </p>
                            <p className="text-success text-margin"><hr className="line"/>{props.price && BillingAmount(props.price)}</p>
                        </div>}
                    </>
                }

                <div className="btn bottom-left" onClick={() => props.nextStep(props.step - 1)}>Previous</div>
                {props.userType == 1 ? <div className={"btn bottom-right " + checkPriceInput(props.viewPrice)} onClick={() => props.nextStep(props.step + 1)}>Next</div>
                : 
                        (props.allowance < props.viewPrice) ? 
                            (<div className={"btn bottom-right " + checkPriceInput(props.viewPrice)} onClick={() => props.approveTokens()}>
                                {props.nextLoading && <div className="loading"><div className="bar"></div></div>}
                                Approve Tokens
                              </div>)
                            :
                           (<div className={"btn bottom-right " + (!props.viewPrice && " disabled")} onClick={() => !props.nextLoading && props.sign()}>
                                {props.nextLoading && <div className="loading"><div className="bar"></div></div>}
                                Sign
                            </div>
                    )
                }
            </div> 
        </>
    )
}