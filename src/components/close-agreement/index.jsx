import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import EscrowABI from "../../data/abi/Escrow.json";
import { storeSkills } from "../../store/actions/agreement-action";
import { uploadDeliveres, decryptDelivery } from "../../store/actions/agreement-action";
import { showNotification } from "../../store/actions/notification-action";

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
            dispatch(showNotification("Please try again", dispatch));
        }
    }

    const releaseFunds = async () => {
        try {
            setRelaseFundsLoading(true)
            const skills_hash = await storeSkills(props.skills);
            const contract = new web3.eth.Contract(EscrowABI, props.escrowAddress);
            
            await contract.methods.releaseFunds(props.agreementAddress, params.id, skills_hash).send({from: wallet});
            props.refresh()
            
        } catch (e) {
            console.log(e)
            dispatch(showNotification("Please try again", dispatch));
        }
        setRelaseFundsLoading(false);
    }

    const raiseDispute = async () => {
        try {
            setDisputeLoading(true)
            const contract = new web3.eth.Contract(EscrowABI, props.escrowAddress);
            await contract.methods.raiseDispute(props.agreementAddress, params.id).send({from: wallet});
            props.refresh()
            
        } catch (e) {
            console.log(e)
            dispatch(showNotification("Please try again", dispatch));
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
            
            await contract.methods.submitDelivery(props.agreementAddress, params.id, delivery).send({from: wallet});
            props.refresh()
        }catch(e){
            console.log(e)
            dispatch(showNotification("Please try again", dispatch));
        }
        setSubmitDeliveryLoading(false);
    }

    const downloadDelivery = async () => {
        try{
            setDownloadLoading(true);
            const durl = await decryptDelivery(deliveryHash, web3)
            window.open(durl, '_blank');
        }catch(e){
            dispatch(showNotification("Please try again", dispatch));
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
                                <input type="file" onChange={(e) => submitDelivery(e)}  />
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