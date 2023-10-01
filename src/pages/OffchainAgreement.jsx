import { AgreementDetails } from "../components/sign-agreement/agreement-details";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { showNotification } from "../store/actions/notification-action";
import { getAgreementEmails, getDetails, getOffchainAgreement, storeSkills } from "../store/actions/agreement-action";
import { Skills } from "../components/sign-agreement/skills";
import EscrowABI from "../data/abi/Escrow.json";
import ERC20ABI from "../data/abi/ERC20.json";
import ProofABI from "../data/abi/Proof.json";
import { estimateAndExecute } from "../helpers/utils";
import { LockScreen } from "../components/sign-agreement/LockScreen";
import BigNumber from "bignumber.js";
import Transak from "../components/transak";

export function OffchainAgreement(){
    const [details, setDetails] = useState({});
    const [skills, setSkills] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(true);
    const [escrowAddress, setEscrowAddress] = useState(false);
    const [allowance, setAllowance] = useState(0);
    const [allowanceLoading, setallowanceLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [signLoading, setSignLoading] = useState(false);
    const [usdPrice, setUsdPrice] = useState(0);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    let params = useParams();

    const { wallet, web3, userInfo, isConnected, balance } = useSelector((state) => state.user);

    useEffect(() => {
        getAgreementDetails();
    }, [web3, wallet]);

    const getAgreementDetails = async () => {
        try {
            console.log("called")
            if(web3){
                console.log("called NEt")
                
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
        } catch (e) {
            dispatch(showNotification("Error while fetching data", dispatch, "danger"));
        }
        setDetailsLoading(false);
    }

    const updateSkills = async (skills_hash) => {
        if(skills_hash){
            const ipfsDetails = await getDetails(skills_hash);
            setSkills(ipfsDetails);
            setDetailsLoading(false)
        }
        setDetailsLoading(false);
    }

    const signAndProceed = async () => {
        try{
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
            );

            const trx = await estimateAndExecute(web3, agreementTrx, wallet);

            const tokenId = trx.events.Transfer[0].returnValues.tokenId;

            if(wallet == client){
                (new BigNumber(allowance).lt(new BigNumber(details.price))) && await approveTokens();
            }
            
            const contract = new web3.eth.Contract(EscrowABI, escrowAddress);
            const signagreement = await contract.methods.signAgreement(details.agreement, tokenId, skills_hash);

            await estimateAndExecute(web3, signagreement, wallet);

            navigate(`/sbt/${details.agreement}/${tokenId}`);
        }catch(e){
            if(e == "GASFEE_ERROR"){
                dispatch(showNotification("Gas Fee Error", dispatch, "danger"));
            }else{
            console.log(e)
            dispatch(showNotification("Unable to Sign agreement", dispatch, "danger"));
            }
        }

        // Redirect to onchain agreement
        setSignLoading(false);
    }

    const approveTokens = async () => {
        try {
            setallowanceLoading(true);
            let contract = new web3.eth.Contract(ERC20ABI, details.token);
    
            let approved = await contract.methods.approve(escrowAddress, details.price);

            await estimateAndExecute(web3, approved, wallet);

            if(approved){
                setAllowance(details.price);
            }
            
        } catch (e) {
            if(e == "GASFEE_ERROR"){
                dispatch(showNotification("Gas Fee Error", dispatch, "danger"));
            }else{
            console.log(e)
            dispatch(showNotification("Unable to Approve Token", dispatch, "danger"));
            }
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
                    <div className={!isConnected ? "p-relative" : ""}>
                    {!isConnected && <LockScreen />}
                    {details.ipfs_hash &&
                        <AgreementDetails {...details} emails={{client: details.client_email, service_provider: details.service_provider_email}} showProgressBar={false} usdPrice={usdPrice} setUsdPrice={setUsdPrice} />
                    }

                    <div>
                        {isConnected && checkifClient() && (
                            <div className="flexBetween">
                                {balance.raw && details.price && (new BigNumber(balance.raw).gte(new BigNumber(details.price))) ?
                                    (details?.mode &&
                                        (<div className="btn withPadding withMargin" onClick={() => !signLoading && signAndProceed()}>
                                                {signLoading && <div className="loading"><div className="bar"></div></div>}
                                                Sign & Proceed
                                        </div>)
                                    ) :
                                    <Transak className="btn withPadding" email={userInfo.email} wallet={wallet} amount={details.price}>Add Funds</Transak>
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
                    </div>  
                </>
            }
        </>
    )
}