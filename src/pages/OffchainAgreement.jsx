import { SignAgreement } from "../components/sign-agreement";
import { AgreementDetails } from "../components/sign-agreement/agreement-details";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { CloseAgreement } from "../components/close-agreement";
import { getDetails, getOffchainAgreement, storeSkills } from "../store/actions/agreement-action";
import { AddNotification } from "../components/add-notification";
import { Skills } from "../components/sign-agreement/skills";
import EscrowABI from "../data/abi/Escrow.json";
import ERC20ABI from "../data/abi/ERC20.json";
import ProofABI from "../data/abi/Proof.json";

export function OffchainAgreement(){
    const [details, setDetails] = useState({});
    const [skills, setSkills] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [escrowAddress, setEscrowAddress] = useState(false);
    const [allowance, setAllowance] = useState(0);
    const [allowanceLoading, setallowanceLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [signLoading, setSignLoading] = useState(false);
    const navigate = useNavigate();

    let params = useParams();

    const { wallet, web3, userInfo, isConnected } = useSelector((state) => state.user);

    useEffect(() => {
        getAgreementDetails();
    }, [web3, wallet]);

    const getAgreementDetails = async () => {
        console.log("called")
        if(web3){
            console.log("called NEt")
            setDetailsLoading(true);
            
            const details = await getOffchainAgreement(params.id)

            console.log(userInfo.email);
            console.log(details.client_email);
            console.log(details.service_provider_email);
            console.log("krckjerc", checkifServiceProvider());

            setEscrowAddress(details.escrow);
            setDetails(details);
            
            updateSkills(details.skills_hash);
            setDetailsLoading(false);
        }
    }

    const updateSkills = async (skills_hash) => {
        if(skills_hash){
            setDetailsLoading(true)
            const ipfsDetails = await getDetails(skills_hash);
            setSkills(ipfsDetails);
            setDetailsLoading(false)
        }
    }

    const signAndProceed = async () => {
        try{
            console.log(details)
            setSignLoading(true);
            let skills_hash = details.skills_hash;
            if(!details.mode){
                skills_hash = await storeSkills(skills);
            }

            const serviceProvider = !details.mode? wallet : details.service_provider;
            const client = details.mode? wallet : details.client;

            const agreementContract = new web3.eth.Contract(ProofABI, details.agreement);
            const agreementTrx = await agreementContract.methods.mint(
                escrowAddress,
                client,
                serviceProvider,
                details.mode,
                details.ipfs_hash,
                skills_hash,
                details.price,
                details.token,
                details.deadline
                ).send({from: wallet});
            
            const tokenId = agreementTrx.events.Transfer[0].returnValues.tokenId;
            
            const contract = new web3.eth.Contract(EscrowABI, escrowAddress);
            await contract.methods.signAgreement(details.agreement, tokenId, skills_hash).send({from: wallet});

            navigate(`/sbt/${details.agreement}/${tokenId}`);
        }catch(e){
            console.log(e);
        }

        // Redirect to onchain agreement
        setSignLoading(false);
    }

    const approveTokens = async () => {
        setallowanceLoading(true);
        let contract = new web3.eth.Contract(ERC20ABI, details.token);

        let approved = await contract.methods.approve(escrowAddress, details.price).send({from: wallet});

        if(approved){
            setAllowance(details.price);
        }
        setallowanceLoading(false)
    }
    
    const checkifClient = () => {
        if(details?.client != "" && wallet?.toLowerCase() == details?.client?.toLowerCase()){
            return true;
        }else if(details?.client == "" && details?.client_email == userInfo?.email){
            return true;
        }

        return false;
    }

    const checkifServiceProvider = () => {
        if(details?.service_provider != "" && wallet?.toLowerCase() == details?.service_provider?.toLowerCase()){
            return true;
        }else if(details?.service_provider == "" && details?.service_provider_email == userInfo?.email){
            return true;
        }

        return false;
    }

    return (
        <>
            {detailsLoading
                ? <><div className="lds-ring"><div></div><div></div><div></div><div></div></div></>
                : <>
                    <h1 className="heading"> Agreement </h1>

                   <AgreementDetails {...details} showProgressBar={false} />

                    <div>
                        {isConnected && checkifClient() && (
                            <div className="flexBetween">
                                {details?.mode &&
                                    ((allowance < details?.price)? 
                                        (<div className="btn withPadding" onClick={() => !allowanceLoading && approveTokens()}>
                                            {allowanceLoading && <div className="loading"><div className="bar"></div></div>}
                                            Approve Tokens and Sign
                                        </div>)
                                    :
                                        (<div className="btn withPadding" onClick={() => !signLoading && signAndProceed()}>
                                            {signLoading && <div className="loading"><div className="bar"></div></div>}
                                            Sign & Proceed
                                        </div>
                                    ))
                                }
                            </div>
                        )}
            
                        {isConnected && checkifServiceProvider() && (
                            <>
                                {!details?.mode && <Skills skills={skills} setSkills={setSkills} />}
                                <div className="flexBetween">
                                    {!details?.mode && <div className="btn withPadding" onClick={() => !signLoading && signAndProceed()}>
                                        {signLoading && <div className="loading"><div className="bar"></div></div>}
                                        Sign & Proceed
                                        </div>}
                                </div>
                            </>
                        )}
                     </div>
                        
                </>
            }
        </>
    )
}