import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import EscrowABI from "../../data/abi/Escrow.json";
import { storeSkills } from "../../store/actions/agreement-action";
import { uploadDeliveres, decryptDelivery } from "../../store/actions/agreement-action";

export function CloseAgreement(props){
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
        const contract = new web3.eth.Contract(EscrowABI, props.escrowAddress);
       const delivery = await contract.methods.deliveries(props.agreementAddress, params.id).call({from: wallet});

       setDeliveryHash(delivery);
    }

    const releaseFunds = async () => {
        setRelaseFundsLoading(true)
        const skills_hash = await storeSkills(props.skills);
        const contract = new web3.eth.Contract(EscrowABI, props.escrowAddress);
        
        await contract.methods.releaseFunds(props.agreementAddress, params.id, skills_hash).send({from: wallet});
        props.refresh()
        setRelaseFundsLoading(false);
    }

    const raiseDispute = async () => {
        setDisputeLoading(true)
        const contract = new web3.eth.Contract(EscrowABI, props.escrowAddress);
        await contract.methods.raiseDispute(props.agreementAddress, params.id).send({from: wallet});
        props.refresh()
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
        }catch(e){}
        setSubmitDeliveryLoading(false);
    }

    const downloadDelivery = async () => {
        try{
            setDownloadLoading(true);
            const durl = await decryptDelivery(deliveryHash, web3)
            window.open(durl, '_blank');
        }catch(e){}
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
                (wallet == props.details?.client?.toLowerCase()) && (
                    <>
                        {props.details.status == 102 &&  props.skills.length > 0 && (
                            <>
                            <div className="type">Rate the skills</div>
                            {
                                props.skills?.map((skill, index) => (
                                    <div>
                                        {skill.name} : 
                                        <input type="range" min="0" max="5" value={skill.rating} onChange={(e) => props.rateSkill(index, e.target.value)} />
                                    </div>
                                ))
                            }
                            </>
                        )}
                        
                        <br />
                        <div className="flexBetween">
                            {props.details.status == 102 && (
                                <div className="btn withPadding" onClick={() => !relaseFundsLoading && releaseFunds()}>
                                    {relaseFundsLoading && <div className="loading"><div className="bar"></div></div>}
                                    Release Funds
                                </div>
                            )}
                            <div className="btn withPadding" onClick={() => !disputeLoading && raiseDispute()}>
                                {disputeLoading && <div className="loading"><div className="bar"></div></div>}
                                Dispute
                            </div>
                        </div>
                    </>
                )
            }

            {
                (wallet == props.details?.service_provider?.toLowerCase()) && (
                    <>
                        <div className="flexBetween">
                            <div className="btn withPadding">
                            {submitDeliveryLoading && <div className="loading"><div className="bar"></div></div>}
                                <span>Submit Delivery</span>
                                <input type="file" onChange={(e) => submitDelivery(e)}  />
                            </div>


                            <div className="btn withPadding" onClick={() => !disputeLoading && raiseDispute()}>
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