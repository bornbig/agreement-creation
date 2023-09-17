import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ContractCreation } from "../components/contract-creation";
import { showNotification } from "../store/actions/notification-action";
import { AddNotification } from "../components/add-notification";
import { getAgreements } from "../store/actions/agreement-action";
import { useNavigate } from "react-router-dom";
import { CONTRACT } from "../config/config";

export function Home(){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [agreements, setAgreements] = useState(null);
    const { isConnected, wallet, web3, chainId } = useSelector((state) => state.user);

    const [canStartContractCreation, setCanStartContractCreation] = useState(false)

    useEffect(() => {
        getMyAgreements();
        setAgreements(null)
    }, [wallet]);

    const createAgreement = () => {
        if(!isConnected){
            dispatch(showNotification("Please connect your wallet first", dispatch, "danger"));
            return;
        }
        setCanStartContractCreation(true);
    }

    const getMyAgreements = async() => {
        if(!agreements && wallet){
            const _agreements = await getAgreements(wallet);
            setAgreements(_agreements);
        }
    }

    const takeMeToAgreement = (tokenid) => {
        navigate(`/sbt/${CONTRACT[chainId].serviceProvider.contract}/${tokenid}`);
    }

    return (
        <>
            <h1 className="heading">Create an Agreement</h1>
            <div className="btn small" onClick={createAgreement}>Start</div>
            <ContractCreation isOpen={canStartContractCreation} closeModal={setCanStartContractCreation}/>

            <section className="mt-4">
                {(agreements !== null)  && <h2>My Agreements</h2>}
                <div className="d-flex-between">
                    {agreements?.map((agreement, index) => (
                        <div className="box-agreemet" onClick={() => takeMeToAgreement(agreement.token_id)}>
                            <img src={agreement.previews.image_small_url} alt="" />
                        </div>
                    ))}
                </div>
            </section>
        </>
    )
}