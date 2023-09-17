import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { showNotification } from "../store/actions/notification-action";
import { useState } from "react";
import transakSDK from '@transak/transak-sdk';


export function Transak(props){
    let params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const [fiatAmount, setfiatAmount] = useState(0);
    const [cryptoAmount, setCryptoAmount] = useState(0);
    const { wallet, web3, isConnected, chainId, userInfo } = useSelector((state) => state.user);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const initializeTransak = () => {
      try {

        let transak = new transakSDK({
            apiKey: 'a7193b71-7510-4225-9df0-c3e31343577b', // (Required)
            environment: 'STAGING', // (Required)
            network: 'polygon',
            cryptoCurrencyCode: "USDT",
            productsAvailed: "BUY",
            fiatCurrency: "USD",
            defaultCryptoAmount	: cryptoAmount,
            defaultPaymentMethod: "pm_jwire",
            widgetHeight: "80%",
            walletAddress: wallet,
            email: userInfo.email
          });
          
          transak.init();
          
          // To get all the events
          transak.on(transak.ALL_EVENTS, (data) => {
            console.log(data);
          });
          
          // This will trigger when the user closed the widget
          transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, (orderData) => {
            transak.close();
          });
          
          // This will trigger when the user marks payment is made
          transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
            console.log(orderData);
            transak.close();
          });
      } catch (e) {
        console.log("wrong")
        dispatch(showNotification("Error while Integrating transak", dispatch, "danger"));
      }
      
    }

    return (
        <> 
            <h1 className="heading"> Add Funds </h1>
            <div className="fund-box">
              <input type="text" className="" onChange={(e) => setCryptoAmount(e.target.value)} defaultValue={0} />
            </div>
            
            <div className="btn small" onClick={initializeTransak}>Add Funds</div>
        </>
    )
}