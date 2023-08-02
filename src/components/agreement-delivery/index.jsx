import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import EscrowABI from "../../data/abi/Escrow.json";
import { storeSkills } from "../../store/actions/agreement-action";

export function AgreementDelivery(props){
    const { wallet, web3 } = useSelector((state) => state.user);
    let params = useParams();
    const [submitDeliveryLoading, setSubmitDeliveryLoading] = useState(false);
    const [disputeLoading, setDisputeLoading] = useState(false);


    const submitDelivery = async () => {
        setSubmitDeliveryLoading(true);

        delivery = ""; //
        const contract = new web3.eth.Contract(EscrowABI, props.escrowAddress);
        
        await contract.methods.submitDelivery(props.agreementAddress, params.id, delivery).send({from: wallet});
        setSubmitDeliveryLoading(false);
    }

    return (
        <>
        <br />
            {
                (wallet == props.details?.client?.toLowerCase()) && (
                    <>
                        <div className="flexBetween">
                            <div className="btn withPadding" onClick={() => !submitDeliveryLoading && releaseFunds()}>
                                {submitDeliveryLoading && <div className="loading"><div className="bar"></div></div>}
                                Release Funds
                            </div>
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
                        <div className="btn withPadding" onClick={() => !disputeLoading && raiseDispute()}>
                            {disputeLoading && <div className="loading"><div className="bar"></div></div>}
                            Dispute
                        </div>
                    </>
                )
            }
        
        </>
    );
}