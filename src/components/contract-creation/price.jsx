import BigNumber from "bignumber.js";
import { useState } from "react";

export function Price(props){
    const { decimals, ticker } = props.selectedToken;
    const [viewPrice, setViewPrice] = useState();
    const bnDecimals = new BigNumber(10).pow(new BigNumber(decimals));

    const formatPrice = (price) => {

        let regexp = /^[0-9.]+$/;

        if(regexp.test(price)){
            setViewPrice(price)
            props.setPrice(new BigNumber(price).mul(bnDecimals).toString());
        }else if(price == ""){
            setViewPrice("")
            props.setPrice(0);
        }
    }

    return (
        <>
            <div className="contract-creation">
                <div className="question">
                    Please select the token and amount of componsation decided.
                </div>
                <div className="note">( Ex: 320 USDT )</div>

                <div className="price-box">
                    <input type="text" onChange={(e) => formatPrice(e.target.value)} value={viewPrice} />
                    <div className="token-drop-down">
                        <div className="selected-token">{ticker} <i className="arrow down"></i></div>
                        <div className="drop-down-list">
                            {props.tokens.map((token, index) => (
                                <div className="item selected" onClick={() => props.setSelectedToken(token)}>{token.ticker}</div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="btn bottom-left" onClick={() => props.nextStep(props.step - 1)}>Previous</div>
                {props.userType == 1 
                    ? <div className="btn bottom-right" onClick={() => props.nextStep(props.step + 1)}>Next</div>
                    : (
                        props.allowance < props.price
                            ? <div className="btn bottom-right" onClick={() => props.approveTokens()}>
                                Approve Tokens
                              </div>
                            : <div className="btn bottom-right" onClick={() => !props.signLoading && props.sign()}>
                                {props.signLoading && <div className="loading"><div className="bar"></div></div>}
                                Sign
                            </div>
                    )
                }
            </div> 
        </>
    )
}