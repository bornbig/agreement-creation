import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_ENDPOINT } from "../../config/config";

export function AddNotification(props){
    const [isRegisterd, setIsRegisterd] = useState(false);
    const { isConnected, wallet, userInfo } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkIfWalletRegisterd();
    }, [wallet]);

    const checkIfWalletRegisterd = async () => {
        setLoading(true)
        if(isConnected){
            try{
                if(userInfo?.email){
                    setIsRegisterd(true);
                }else{
                    await axios.get(API_ENDPOINT + "/telegram/check?wallet="+ wallet);
                    setIsRegisterd(true);
                }
            }catch(e){
                setIsRegisterd(false);
            }
        }
        setLoading(false);
    }

    return(
        <>
        {loading? <div className="lds-ring"><div></div><div></div><div></div><div></div></div> :
        (!wallet ? <> <div className="wallet-message">Please connect your wallet from right top corner</div> </>
            :
            (!isRegisterd ? <a className="btn" target="_blank" href={"https://t.me/defic_test_bot?start="+wallet}>Add Telegram Notification</a>
                : <>{props.children}</>
            )
        )}
        </>
    )
}