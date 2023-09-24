import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import EscrowABI from "../../data/abi/Escrow.json";
import { storeSkills } from "../../store/actions/agreement-action";
import { uploadDeliveres, decryptDelivery } from "../../store/actions/agreement-action";
import { showNotification } from "../../store/actions/notification-action";
import { estimateAndExecute } from "../../helpers/utils";

export function CloseAgreement(props){
    const dispatch = useDispatch();
    const { wallet, web3 } = useSelector((state) => state.user);
    let params = useParams();
    const [relaseFundsLoading, setRelaseFundsLoading] = useState(false);
    const [disputeLoading, setDisputeLoading] = useState(false);
    const [submitDeliveryLoading, setSubmitDeliveryLoading] = useState(false);
    const [deliveryHash, setDeliveryHash] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);

    useEffect(() => {
        if(props.details.status == 102){
            getDelivery();
        }
    }, [web3, wallet]);

    const getDelivery = async () => {
        try {
            const contract = new web3.eth.Contract(EscrowABI, props.escrowAddress);
            const delivery = await contract.methods.deliveries(props.agreementAddress, params.id).call({from: wallet});
    
            setDeliveryHash(delivery);
            
        } catch (e) {
            console.log(e)
            dispatch(showNotification("Unable to get Delivery right now", dispatch, "danger"));
        }
    }

    const releaseFunds = async () => {
        try {
            setRelaseFundsLoading(true)
            const skills_hash = await storeSkills(props.skills);
            const contract = new web3.eth.Contract(EscrowABI, props.escrowAddress);
            
            const releasefund = await contract.methods.releaseFunds(props.agreementAddress, params.id, skills_hash);

            await estimateAndExecute(web3, releasefund, wallet);

            props.refresh()
            
        } catch (e) {
            if(e == "GASFEE_ERROR"){
                dispatch(showNotification("Gas Fee Error", dispatch, "danger"));
            }else{
                console.log(e)
                dispatch(showNotification("Unable to release fund right now", dispatch, "danger"));
            }
            
        }
        setRelaseFundsLoading(false);
    }

    const raiseDispute = async () => {
        try {
            setDisputeLoading(true)
            const contract = new web3.eth.Contract(EscrowABI, props.escrowAddress);
            const raiseDispute = await contract.methods.raiseDispute(props.agreementAddress, params.id);

            await estimateAndExecute(web3, raiseDispute, wallet);
            props.refresh()
            
        } catch (e) {
            if(e == "GASFEE_ERROR"){
                dispatch(showNotification("Gas Fee Error", dispatch, "danger"));
            }else{
            console.log(e)
            dispatch(showNotification("Unable to raise Dispute right now", dispatch, "danger"));
            }
        }
        setDisputeLoading(false)
    }

    const submitDelivery = async (e) => {
        try{
            setSubmitDeliveryLoading(true);
    
            const delivery = await uploadDeliveres(e, web3, {
                escrow:  props.escrowAddress,
                agreement: props.agreementAddress,
                agreementId: params.id
            }, (o) => {})
    
            const contract = new web3.eth.Contract(EscrowABI, props.escrowAddress);
            
            const submitdelivery = await contract.methods.submitDelivery(props.agreementAddress, params.id, delivery);
            
            await estimateAndExecute(web3, submitdelivery, wallet)

            props.refresh()
        }catch(e){
            if(e == "GASFEE_ERROR"){
                dispatch(showNotification("Gas Fee Error", dispatch, "danger"));
            }else{
                console.log(e)
                dispatch(showNotification("Unable to Submit Delivery right now", dispatch, "danger"));
            }
        }
        setSubmitDeliveryLoading(false);
    }

    const downloadDelivery = async () => {
        try{
            setDownloadLoading(true);
            const durl = await decryptDelivery(deliveryHash, web3)
            window.open(durl, '_blank');
        }catch(e){
            dispatch(showNotification("Unable to download delivery right now", dispatch, "danger"));
        }
        setDownloadLoading(false);
    }

    return (
        <>
        <br />
        {props.details.status == 102 
        && deliveryHash 
        && (
            <div onClick={downloadDelivery} className="btn">
                {downloadLoading && <div className="loading"><div className="bar"></div></div>}
                Download Delivery
            </div>
            )
        }
        <br />
            {
                (wallet?.toLowerCase() == props.details?.client?.toLowerCase()) && (
                    <>
                        {props.details.status == 102 &&  props.skills.length > 0 && (
                            <>
                            <div className="type">Rate the skills</div>
                            {
                                props.skills?.map((skill, index) => (
                                    <div>
                                        {skill.name} : 
                                        <input type="range" min="0" max="5" onChange={(e) => props.rateSkill(index, e.target.value)} />
                                    </div>
                                ))
                            }
                            </>
                        )}
                        
                        <br />
                        <div className="flexBetween">
                            {props.details.status == 102 && (
                                <div className="btn withPadding withMargin" onClick={() => !relaseFundsLoading && releaseFunds()}>
                                    {relaseFundsLoading && <div className="loading"><div className="bar"></div></div>}
                                    Release Funds
                                </div>
                            )}
                            <div className="btn withPadding withMargin" onClick={() => !disputeLoading && raiseDispute()}>
                                {disputeLoading && <div className="loading"><div className="bar"></div></div>}
                                Dispute
                            </div>
                        </div>
                    </>
                )
            }

            {
                (wallet?.toLowerCase() == props.details?.service_provider?.toLowerCase()) && (
                    <>
                        <div className="flexBetween">
                            <div className="btn withPadding withMargin">
                            {submitDeliveryLoading && <div className="loading"><div className="bar"></div></div>}
                                <span>Submit Delivery</span>
                                <input type="file" onChange={(e) => submitDelivery(e)} accept=".zip" />
                            </div>


                            <div className="btn withPadding withMargin" onClick={() => !disputeLoading && raiseDispute()}>
                                {disputeLoading && <div className="loading"><div className="bar"></div></div>}
                                Dispute
                            </div>
                        </div>
                    </>
                )
            }
        
        </>
    );
}