import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { showNotification } from "../store/actions/notification-action";
import axios from "axios";
import { API_ENDPOINT } from "../config/config";
import { useState } from "react";


export function Verify(props){
    let params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const { wallet, web3, isConnected, chainId } = useSelector((state) => state.user);

    const signAndVrify = async () => {
        try{
            setLoading(true)
            const signature = await web3.eth.personal.sign(params.id.toString(), wallet)
            
            if(signature){
                const submitSignature = await axios.post(API_ENDPOINT + "/telegram/verify", {
                    message: params.id.toString(),
                    hash: signature,
                    chain_id: parseInt(chainId)
                });
                showNotification("Notification Bot Added", dispatch)
                navigate(`/`);
            }
        }catch(e){
            showNotification("Error: Please try again", dispatch)
            // console.log(e);
        }
        setLoading(false)
    }

    return (
        <>
            <h1 className="heading"> Verify </h1>

            <div className="btn" onClick={signAndVrify}>
                {loading && <div className="loading"><div className="bar"></div></div>}
                Sign and Verify
            </div>
        </>
    )
}