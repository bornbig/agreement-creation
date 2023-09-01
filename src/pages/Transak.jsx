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
    const { wallet, web3, isConnected, chainId } = useSelector((state) => state.user);

    const initializeTransak = () => {
        let transak = new transakSDK({
            apiKey: '295ba884-3204-42e4-8a64-924e080e25de', // (Required)
            environment: 'STAGING', // (Required)
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
          
    }

    initializeTransak();


    return (
        <>
            <h1 className="heading"> Add USDT </h1>
        </>
    )
}