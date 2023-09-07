import BigNumber from "bignumber.js";
import { useState } from "react";
import { getUSDTQuote } from "../../store/actions/price-discovery";

export function Price(props){
    const { decimals, ticker } = props.selectedToken;
    const bnDecimals = new BigNumber(10).pow(new BigNumber(decimals));
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
        let regexp = /^[0-9.]+$/;

        if(regexp.test(usdPrice)){
            props.setViewPrice(usdPrice);
            updateUsdtPrice(usdPrice);
        }else if(usdPrice == ""){
            props.setViewPrice("")
            props.setPrice(0);
        }
    }

    const updateUsdtPrice = async (usdPrice) => {
        const usdtReposnse = await getUSDTQuote(usdPrice);
        setQuote(usdtReposnse.response);
        props.setPrice(new BigNumber(usdtReposnse.response.cryptoAmount).mul(bnDecimals).toString());
    }


    return (
        <>
            <div className="contract-creation">
                <div className="question">
                    Please select the token and amount of componsation decided.
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
                    <input type="text" onChange={(e) => updateFiat(e.target.value)} value={props.viewPrice} />
                </div>

                {<div className="note success">
                    {props.price && (props.price /bnDecimals) + " USDT"}
                </div>}

                <div className="btn bottom-left" onClick={() => props.nextStep(props.step - 1)}>Previous</div>
                {props.userType == 1 
                    ? <div className="btn bottom-right" onClick={() => props.nextStep(props.step + 1)}>Next</div>
                    : (
                        props.allowance < props.price
                            ? <div className="btn bottom-right" onClick={() => props.approveTokens()}>
                                {props.nextLoading && <div className="loading"><div className="bar"></div></div>}
                                Approve Tokens
                              </div>
                            : <div className="btn bottom-right" onClick={() => !props.nextLoading && props.sign()}>
                                {props.nextLoading && <div className="loading"><div className="bar"></div></div>}
                                Sign
                            </div>
                    )
                }
            </div> 
        </>
    )
}