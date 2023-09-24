import { SignAgreement } from "../components/sign-agreement";
import ProofABI from "../data/abi/Proof.json";
import { AgreementDetails } from "../components/sign-agreement/agreement-details";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CloseAgreement } from "../components/close-agreement";
import { getAgreementEmails, getDetails } from "../store/actions/agreement-action";
import { showNotification } from "../store/actions/notification-action";
import { LockScreen } from "../components/sign-agreement/LockScreen";

export function Agreement(){
    const dispatch = useDispatch();
    const [details, setDetails] = useState({});
    const [skills, setSkills] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(true);
    const [escrowAddress, setEscrowAddress] = useState(false);
    const [emailAddress, setEmailAddress] = useState({});
    const { wallet, web3, isConnected, chainId } = useSelector((state) => state.user);
    const [usdPrice, setUsdPrice] = useState(0);
    let params = useParams();

    
    useEffect(() => {
        getAgreementDetails();
        updateAgreementEmails();
    }, [web3, wallet]);

    const getAgreementDetails = async () => {
        try {
            if(web3){
                setDetailsLoading(true)
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

    const updateAgreementEmails = async () => {
        try {
            const {client, service_provider} = await getAgreementEmails(chainId, params.contract, params.id);
            console.log({client, service_provider});
            setEmailAddress({client, service_provider})
        }catch(e){
            console.log("Error", e);
        }
    }

    const updateSkills = async (skills_hash) => {
        if(skills_hash){
            // setDetailsLoading(true)
            const ipfsDetails = await getDetails(skills_hash);
            setSkills(ipfsDetails);
            // setDetailsLoading(false)
        }
    }

    const rateSkill = async (index, value) => {
        let localSkill = skills;
        localSkill[index].rating = value;
        setSkills(localSkill);
    }
    
    const agreementCancelled = () => {
        if((details.status == 98) || (details.status == 99) || (details.status == 90) || (details.status == 201)){
            return false;
        }
        return true;
    }

    return (
        <>
            {detailsLoading
                ? <><div className="lds-ring"><div></div><div></div><div></div><div></div></div></>
                : <>
                    <h1 className="heading"> Agreement </h1>
                    <div className={!isConnected ? "p-relative" : ""}>
                    {!isConnected && <LockScreen />}
                    <AgreementDetails {...details} emails={emailAddress} showProgressBar={agreementCancelled()} usdPrice={usdPrice} setUsdPrice={setUsdPrice}/>
                        {details.status == 100 && <SignAgreement details={details} refresh={getAgreementDetails} escrowAddress={escrowAddress} agreementAddress={params.contract} usdPrice={usdPrice}/>}
                        {(details.status == 101 || details.status == 102) && <CloseAgreement details={details} refresh={getAgreementDetails} skills={skills} rateSkill={rateSkill} escrowAddress={escrowAddress} agreementAddress={params.contract} />}
                        <div className="div-cancel">
                        {details.status == 98 && <p className="btn-cancel">Service Provider Rejected It</p>}
                        {details.status == 99 && <p className="btn-cancel">Client Cancelled It</p>}
                        {details.status == 90 && <p className="btn-cancel">Wait for dispute to be resolved</p>}
                        {details.status == 201 && <p className="btn-cancel">The dispute is resolved</p>}
                        </div>
                   </div>     
                </>
            }
        </>
    )
}