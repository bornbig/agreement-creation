import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { showNotification } from "../store/actions/notification-action";
import { useState } from "react";
import Transak from "../components/transak";


export default function Wallet(props){
    let params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const [fiatAmount, setfiatAmount] = useState(0);
    const [cryptoAmount, setCryptoAmount] = useState(0);
    const { wallet, web3, isConnected, chainId, userInfo, balance } = useSelector((state) => state.user);
    const [detailsLoading, setDetailsLoading] = useState(false);

    return (
        <div className="container mh-100"> 
        <br />
        {!web3 && <><div className="lds-ring"><div></div><div></div><div></div><div></div></div></>}
        <br /><br />

            <div className="heading">
              ${balance?.usdBalance}
            </div>
            <div className="amount small">{balance?.humanReadable} USDT</div>
            <div className='wallet-address'>
              {/* <img src="/images/copy.png" alt="" onClick={() => textcopying()} /> */}
              <span>{wallet}</span>
            </div>
            <br />
            <div className="buttonGroup">
              {userInfo?.email &&
              <>
                <Transak className="btn large" productsAvailed="BUY" email={userInfo.email} wallet={wallet} amount={cryptoAmount}>
                  Add Funds
                  </Transak>
                  <Transak className="btn large" productsAvailed="SELL" email={userInfo.email} wallet={wallet} amount={cryptoAmount}>
                  Withdraw Funds
                  </Transak>
              </>
              }
            </div>
        </div>
    )
}