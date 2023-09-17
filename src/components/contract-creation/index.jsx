import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CONTRACT } from "../../config/config";
import { createOfflineAgreement, storeDetails, storeSkills } from "../../store/actions/agreement-action";
import { showNotification } from "../../store/actions/notification-action";
import "./style.css";
import { Modal } from "../modal";
import { SelectUserType } from "./select-user-type";
import { UserAddress } from "./user-address";
import { AgreementDetails } from "./agreement-details";
import { Deliverables } from "./deliverables";
import { Price } from "./price";
import { Skills } from "./skills";
import { Deadline } from "./deadline";

export function ContractCreation(props){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { wallet, web3, chainId, userInfo } = useSelector((state) => state.user);
    const [step, setStep] = useState(0);
    const [userType, setUserType] = useState(1);
    const [client, setClient] = useState("");
    const [serviceProvider, setServiceProvider] = useState("");
    const [details, setDetails] = useState("");
    const [delivery, setDelivery] = useState("");
    const [price, setPrice] = useState("");
    const [skills, setSkills] = useState([]);
    const [allowance, setAllowance] = useState(0);
    const [nextLoading, setNextLoading] = useState(false)
    const [selectedToken, setSelectedToken] = useState()
    const [deadlineValue, setDeadlineValue] = useState();
    const [deadlineRange, setDeadlineRange] = useState("Days");
    const [userInput, setUserInput] = useState("");
    const [viewPrice, setViewPrice] = useState();
    const [activeModel, setActiveModel] = useState("Agreement");

    useEffect(() => {
        if(userType == 2){
            switchUserType(userType);
        }else if(userType == 1){
            switchUserType(userType);
        }

        if(chainId){
            setSelectedToken(CONTRACT[chainId]?.tokens[0]);
        }
    }, [wallet]);


    const getDeadlineTimestamp = async () => {
        const blockNumber = await web3.eth.getBlockNumber();
        const timestamp = (await web3.eth.getBlock(blockNumber)).timestamp;

        let valueInMinutes;
        if(deadlineRange == "Days"){
            valueInMinutes = deadlineValue * 24 * 60 * 60;
        }else if(deadlineRange == "Hours"){
            valueInMinutes = deadlineValue * 60 * 60;
        }else if(deadlineRange == "Minutes"){
            valueInMinutes = deadlineValue * 60;
        }
        const newTimestamp = timestamp + valueInMinutes;

        console.log(valueInMinutes);
        return newTimestamp;
    }


    const createAndSignAgreement = async () => {
        try{
            setNextLoading                         (true);
            const ipfs_hash = await storeDetails(details, delivery)

            let skills_hash = "";

            if(wallet == serviceProvider){
                skills_hash = await storeSkills(skills)
            }

            const deadline = await getDeadlineTimestamp();

            let tokenId;
            if(serviceProvider != "" && client != ""){
                tokenId = await createOnchainAgreement(ipfs_hash, skills_hash, deadline);
                dispatch(showNotification("Agreement is created", dispatch));
                navigate(`/sbt/${CONTRACT[chainId].serviceProvider.contract}/${tokenId}`);
            }else{
                tokenId = await createOffChainAgreement(ipfs_hash, skills_hash, deadline);
                dispatch(showNotification("Agreement is created", dispatch));
                navigate(`/offchain/${tokenId}`);
            }
            
        }catch(e){
            console.log(e);
            dispatch(showNotification("Unable to Create Agreement", dispatch, "danger"));
        }
        setNextLoading                         (false);
    }

    const createOffChainAgreement = async (ipfs_hash, skills_hash, deadline) => {
        const mode = wallet == serviceProvider;
        let secondPartyEmail;
        if(userInput.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          )){
            secondPartyEmail = userInput;
          }
        const service_provider_email = mode? userInfo?.email : secondPartyEmail;
        const client_email = !mode? userInfo?.email : secondPartyEmail;

        const tokenId = createOfflineAgreement(chainId, CONTRACT[chainId].serviceProvider.contract, {
            escrow: CONTRACT[chainId].escrow.contract,
            client,
            service_provider: serviceProvider,
            mode,
            ipfs_hash,
            skills_hash,
            price,
            token: selectedToken.contract,
            deadline,
            service_provider_email,
            client_email,
        });

        return tokenId;
    }

    const createOnchainAgreement = async (ipfs_hash, skills_hash, deadline) => {

        let contract = new web3.eth.Contract(CONTRACT[chainId].serviceProvider.abi, CONTRACT[chainId].serviceProvider.contract);
        const transaction = await contract.methods.mint(
            CONTRACT[chainId].escrow.contract,
            client,
            serviceProvider,
            wallet == serviceProvider,
            ipfs_hash,
            skills_hash,
            price,
            selectedToken.contract,
            deadline
            ).send({from: wallet});

        const tokenId = transaction.events.Transfer[0].returnValues.tokenId;

        return tokenId;
    }

    const checkIfAmountApproved = async () => {
        try{
            let contract = new web3.eth.Contract(CONTRACT[chainId].tokenAbi, selectedToken.contract);

            let approvedAmount = await contract.methods.allowance(wallet, CONTRACT[chainId].escrow.contract).call();

            setAllowance(approvedAmount);
        }catch(e){
            dispatch(showNotification("Unable to approve amount", dispatch, "danger"));
        }
        
    }

    const approveTokens = async () => {
        try {
            setNextLoading(true)
            let contract = new web3.eth.Contract(CONTRACT[chainId].tokenAbi, selectedToken.contract);

            let approved = await contract.methods.approve(CONTRACT[chainId].escrow.contract, price).send({from: wallet});

            if(approved){
                setAllowance(price); // for client
            }
        } catch (error) {
            dispatch(showNotification("Unable to approve tokens", dispatch, "danger"));
        }
        setNextLoading(false)
    }

    const switchUserType = (value) => {
        setUserType(value);
        
        if(value == 2){
            setClient(wallet);
            setServiceProvider("");
            checkIfAmountApproved();
        }else if(value == 1){
            setServiceProvider(wallet);
            setClient("");
        }
    }

    return (<>
        <Modal 
            header={
            <div className="toggle-btn">
                <div className={"tab " + (activeModel === "Agreement" && "active" )}
                        onClick={() => setActiveModel("Agreement")} >Agreement</div>
                <div 
                    className={"tab " + (activeModel === "Payment" && "active")} 
                        onClick={() => setActiveModel("Payment")}
                        >Payment</div>
            </div>}
            isOpen={props.isOpen} closeModal={props.closeModal} big={true} activeModel={activeModel} setActiveModel={setActiveModel}>  
        <>
        {activeModel === "Agreement" && (<> 
            {(step == 0) && <SelectUserType nextStep={setStep} step={step} userType={userType} setUserType={switchUserType}/>}
            {(step == 1) && <UserAddress userInput={userInput} setUserInput={setUserInput} nextStep={setStep} step={step} userType={userType} client={client} serviceProvider={serviceProvider} setClient={setClient} setServiceProvider={setServiceProvider} nextLoading={nextLoading} setNextLoading={setNextLoading}/>}
            {(step == 2) && <Deadline nextStep={setStep} step={step} deadlineValue={deadlineValue} setDeadlineValue={setDeadlineValue} deadlineRange={deadlineRange} setDeadlineRange={setDeadlineRange}/>}
            {(step == 3) && <AgreementDetails nextStep={setStep} step={step} details={details} setDetails={setDetails} />}
            {(step == 4) && <Deliverables nextStep={setStep} step={step} delivery={delivery} setDelivery={setDelivery}  />}
            {(step == 5) && <Price approveTokens={approveTokens} nextLoading={nextLoading} setNextLoading={setNextLoading} nextStep={setStep} step={step}
                                 sign={createAndSignAgreement} allowance={allowance} price={price}
                                  setPrice={setPrice} userType={userType} setSelectedToken={setSelectedToken}
                                  selectedToken={selectedToken} setViewPrice={setViewPrice} viewPrice={viewPrice}/>}
            {(step == 6) && <Skills nextLoading={nextLoading} nextStep={setStep} step={step} sign={createAndSignAgreement} skills={skills} setSkills={setSkills}  />}
        </> ) }
        {activeModel === "Payment" && (<>
            <h1 class='developer-lines'>Coming soon...</h1>
        </>)}
       
            
            </>
        </Modal> 
       
        {/* {
            (userType == 2 && allowance < price)?
                <div className="btn" onClick={approveTokens}>Approve Tokens</div>
            :
                <div className="btn" onClick={createAndSignAgreement}>Create Contract</div>
        }  */}
    </>)
}