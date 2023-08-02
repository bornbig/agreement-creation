import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CONTRACT } from "../../config/config";
import { storeDetails, storeSkills } from "../../store/actions/agreement-action";
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
    const { wallet, web3, chainId } = useSelector((state) => state.user);
    const [step, setStep] = useState(0);
    const [userType, setUserType] = useState(1);
    const [client, setClient] = useState("");
    const [serviceProvider, setServiceProvider] = useState("");
    const [details, setDetails] = useState("");
    const [delivery, setDelivery] = useState("");
    const [price, setPrice] = useState("");
    const [skills, setSkills] = useState([]);
    const [allowance, setAllowance] = useState(0);
    const [signLoading, setSignLoadin] = useState(false)
    const [selectedToken, setSelectedToken] = useState()
    const [deadlineValue, setDeadlineValue] = useState();
    const [deadlineRange, setDeadlineRange] = useState("Days");

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
            setSignLoadin(true);
            const ipfs_hash = await storeDetails(details, delivery)

            let skills_hash = "";

            if(wallet == serviceProvider){
                skills_hash = await storeSkills(skills)
            }

            const deadline = await getDeadlineTimestamp();

            console.log(CONTRACT[chainId].escrow.contract,
                client,
                serviceProvider,
                wallet == serviceProvider,
                ipfs_hash,
                skills_hash,
                price,
                selectedToken.contract,
                deadline);
    
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

            dispatch(showNotification("Agreement is created", dispatch));

            navigate(`/sbt/${CONTRACT[chainId].serviceProvider.contract}/${tokenId}`);
            
        }catch(e){
            console.log(e);
        }
        setSignLoadin(false);
    }

    const checkIfAmountApproved = async () => {
        let contract = new web3.eth.Contract(CONTRACT[chainId].tokenAbi, selectedToken.contract);

        let approvedAmount = await contract.methods.allowance(wallet, CONTRACT[chainId].escrow.contract).call();

        setAllowance(approvedAmount);
    }

    const approveTokens = async () => {
        let contract = new web3.eth.Contract(CONTRACT[chainId].tokenAbi, selectedToken.contract);

        let approved = await contract.methods.approve(CONTRACT[chainId].escrow.contract, price).send({from: wallet});

        if(approved){
            setAllowance(price);
        }
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
        <Modal isOpen={props.isOpen} closeModal={props.closeModal} big={true}>
            {(step == 0) && <SelectUserType nextStep={setStep} step={step} userType={userType} setUserType={switchUserType}/>}
            {(step == 1) && <UserAddress nextStep={setStep} step={step} userType={userType} client={client} serviceProvider={serviceProvider} setClient={setClient} setServiceProvider={setServiceProvider}/>}
            {(step == 2) && <Deadline nextStep={setStep} step={step} deadlineValue={deadlineValue} setDeadlineValue={setDeadlineValue} deadlineRange={deadlineRange} setDeadlineRange={setDeadlineRange}/>}
            {(step == 3) && <AgreementDetails nextStep={setStep} step={step} details={details} setDetails={setDetails} />}
            {(step == 4) && <Deliverables nextStep={setStep} step={step} delivery={delivery} setDelivery={setDelivery}  />}
            {(step == 5) && <Price approveTokens={approveTokens} signLoading={signLoading} nextStep={setStep} step={step}
                                 sign={createAndSignAgreement} allowance={allowance} price={price}
                                  setPrice={setPrice} userType={userType} tokens={CONTRACT[chainId].tokens} setSelectedToken={setSelectedToken}
                                  selectedToken={selectedToken} />}
            {(step == 6) && <Skills signLoading={signLoading} nextStep={setStep} step={step} sign={createAndSignAgreement} skills={skills} setSkills={setSkills}  />}
        </Modal>
       
        {/* {
            (userType == 2 && allowance < price)?
                <div className="btn" onClick={approveTokens}>Approve Tokens</div>
            :
                <div className="btn" onClick={createAndSignAgreement}>Create Contract</div>
        }  */}
    </>)
}