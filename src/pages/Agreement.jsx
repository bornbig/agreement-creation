import { SignAgreement } from "../components/sign-agreement";
import ProofABI from "../data/abi/Proof.json";
import { AgreementDetails } from "../components/sign-agreement/agreement-details";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CloseAgreement } from "../components/close-agreement";
import { getDetails } from "../store/actions/agreement-action";
import { AddNotification } from "../components/add-notification";
import { showNotification } from "../store/actions/notification-action";

export function Agreement(){
    const dispatch = useDispatch();
    const [details, setDetails] = useState({});
    const [skills, setSkills] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [escrowAddress, setEscrowAddress] = useState(false);
    let params = useParams();
    const { wallet, web3, isConnected } = useSelector((state) => state.user);
    const [usdPrice, setUsdPrice] = useState(0);

    
    useEffect(() => {
        getAgreementDetails();
    }, [web3, wallet]);

    const getAgreementDetails = async () => {
        try {
            if(web3){
                setDetailsLoading(true);
                let contract = new web3.eth.Contract(ProofABI, params.contract);
                let details = await contract.methods.getAgreementDetails(params.id).call({from: wallet});
                let escrow = await contract.methods.escrowUsed(params.id).call({from: wallet});
    
                setEscrowAddress(escrow);
                setDetails(details);
                
                updateSkills(details.skills);
            }
            
        } catch (e) {
            dispatch(showNotification("Unable to get Agreement Details", dispatch, "danger"));
        }
        setDetailsLoading(false);
    }

    const updateSkills = async (skills_hash) => {
        if(skills_hash){
            setDetailsLoading(true)
            const ipfsDetails = await getDetails(skills_hash);
            setSkills(ipfsDetails);
            setDetailsLoading(false)
        }
    }

    const rateSkill = async (index, value) => {
        let localSkill = skills;
        localSkill[index].rating = value;
        setSkills(localSkill);
    }

    return (
        <>
            {detailsLoading
                ? <><div className="lds-ring"><div></div><div></div><div></div><div></div></div></>
                : <>
                    <h1 className="heading"> Agreement </h1>
                    <AgreementDetails {...details} showProgressBar={true} usdPrice={usdPrice} setUsdPrice={setUsdPrice}/>
                        {details.status == 100 && <SignAgreement details={details} refresh={getAgreementDetails} escrowAddress={escrowAddress} agreementAddress={params.contract} usdPrice={usdPrice}/>}
                        {(details.status == 101 || details.status == 102) && <CloseAgreement details={details} refresh={getAgreementDetails} skills={skills} rateSkill={rateSkill} escrowAddress={escrowAddress} agreementAddress={params.contract} />}

                        {details.status == 98 && <h1>Service Provider Rejected it</h1>}
                        {details.status == 98 && <h1>Client Cancelled it</h1>}
                        {details.status == 90 && <h1>Wait for dispute to be resolved.</h1>}
                        {details.status == 201 && <h1>The dispute is resolved.</h1>}
                        
                </>
            }
        </>
    )
}