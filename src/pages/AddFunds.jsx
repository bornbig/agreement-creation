import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { showNotification } from "../store/actions/notification-action";
import { useState } from "react";
import Transak from "../components/transak";


export default function AddFundsPage(props){
    let params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const [fiatAmount, setfiatAmount] = useState(0);
    const [cryptoAmount, setCryptoAmount] = useState(0);
    const { wallet, web3, isConnected, chainId, userInfo } = useSelector((state) => state.user);
    const [detailsLoading, setDetailsLoading] = useState(false);

    return (
        <> 
            <h1 className="heading"> Add Funds </h1>
            <div className="fund-box">
              <input type="number" className="no-spinner" onChange={(e) => setCryptoAmount(e.target.value)} defaultValue={0} />
            </div>
            {userInfo?.email &&
              <Transak className="btn small" email={userInfo.email} wallet={wallet} amount={cryptoAmount}>
                Add Funds
                </Transak>
            }
        </>
    )
}