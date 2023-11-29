import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { showNotification } from "../store/actions/notification-action";
import { createOnchainPayment, deleteOffChainPayment, getOnchainPayment, getPaymentById, saveToIPFS, uploadDeliveres } from "../store/actions/payment-action";
import EscrowABI from "../data/abi/Escrow.json";
import ERC20ABI from "../data/abi/ERC20.json";
import { CANCELLED, CREATED, DELIVERD, DISPUTED, DISPUTE_RESOLVED_BOTH_WON, DISPUTE_RESOLVED_CLIENT_WON, DISPUTE_RESOLVED_SERVICE_WON, RELEASED, SIGNED } from "../config/status-constant";
import { estimateAndExecute, executeMultipleMethod } from "../helpers/utils";
import { CONTRACT } from "../config/config";
import { Modal } from "../components/modal";
import { VerifyEmail } from "../components/verify-email";
import { PaymentOnChain } from "../components/paymentOnChain";

export function PaymentReceipt(){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [detailsLoading, setDetailsLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({});
    const [OnChainPaymentDetails, setOnChainPaymentDetails] = useState({});
    const [skills, setSkills] = useState([]);
    const [input, setInput] = useState('');
    const [rating, setRating] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingLeft, setLoadingLeft] = useState(false);
    const [loadingRight, setLoadingRight] = useState(false);
    const { wallet, web3, smartAccount, user, isConnected, chainId } = useSelector((state) => state.user);
    let params = useParams();


    useEffect(() => {
        // only when user is logged in
        if(web3){
            getPaymentDetails();
        }
    }, [web3]);

    const getPaymentDetails = async () => {
        setDetailsLoading(true);

        try{
            const payment = params.contract? await getOnchainPayment(params.chainid, params.contract, params.id) : await getPaymentById(params.id);
            getOnchainPaymentDetails(payment.escrowContract, payment.receiverContract, payment?.tokenId);
            setPaymentDetails(payment);
        }catch(e){
            dispatch(showNotification("Unable to get Agreement Details", dispatch, "danger"));
        }

        setDetailsLoading(false);
    }

    const getOnchainPaymentDetails = async (escrowContract, receiverContract, tokenId) => {
        if(tokenId){
            setStatusLoading(true);
            let contract = new web3.eth.Contract(EscrowABI, escrowContract);
            let details = await contract.methods.getPaymentDetails(receiverContract, tokenId).call({from: wallet})
            setOnChainPaymentDetails(details)
            setStatusLoading(false);
        }
    }

    const createPaymentOnChain = async () => {
        let skillHash = "";

        let skillObj = {};
        if(isReceiver()){
            for(let i = 0; i < skills.length; i++){
                skillObj = {...skillObj, [skills[i]]: null}
            }
        }
        skillHash = (skills.length == 0)? null : await saveToIPFS(skillObj);

        let _accounts = await web3.eth.getAccounts();
        const message = wallet;
        const signature = await web3.eth.personal.sign(message, _accounts[0]);

        await createOnchainPayment({message, signature, paymentid: paymentDetails.paymentid})

        getPaymentDetails();
    }

    const acceptPaymentProposal = async () => {
        setLoadingRight(true)

        const {escrowContract, receiverContract, tokenId} = paymentDetails;
        let skillHash = "";
        let methods = [];

        if(isSender()){
            // Approve Tokens TRX
            let erc20Contract = new web3.eth.Contract(ERC20ABI, CONTRACT["0x89"].tokens[0].contract);
            let method = erc20Contract.methods.approve(escrowContract, paymentDetails.amount.toString());
            methods.push({method, to: CONTRACT["0x89"].tokens[0].contract});
        }else if(isReceiver()){
            // Add Skills
            let skillObj = {};
            for(let i = 0; i < skills.length; i++){
                skillObj = {...skillObj, [skills[i]]: null}
            }
            skillHash = (skills.length == 0)? null : await saveToIPFS(skillObj)
        }

        let contract = new web3.eth.Contract(EscrowABI, escrowContract);
        let method = await contract.methods.acceptReceipt(receiverContract, tokenId, skillHash);
        methods.push({method, to: escrowContract});
        await executeMultipleMethod(smartAccount, methods);

        setLoadingRight(false)
        getPaymentDetails();
    }

    const rejectPaymentProposal = async() => {
        setLoadingLeft(true);
        const {escrowContract, receiverContract, tokenId} = paymentDetails;

        let contract = new web3.eth.Contract(EscrowABI, escrowContract);
        let method = await contract.methods.cancelPayment(receiverContract, tokenId);
        await estimateAndExecute(smartAccount, method, escrowContract);
        setLoadingLeft(false)
        getPaymentDetails();
    }

    const rejectOffchainProposal = async() => {
        setLoadingLeft(true);

        let _accounts = await web3.eth.getAccounts();
        const message = wallet;
        const signature = await web3.eth.personal.sign(message, _accounts[0]);

        await deleteOffChainPayment(message, signature, paymentDetails.paymentid);

        setLoadingLeft(false)
        getPaymentDetails();
    }

    const raiseDispute = async() => {
        setLoadingLeft(true)
        const {escrowContract, receiverContract, tokenId} = paymentDetails;

        let contract = new web3.eth.Contract(EscrowABI, escrowContract);
        let method = await contract.methods.raiseDispute(receiverContract, tokenId);
        await estimateAndExecute(smartAccount, method, escrowContract);
        setLoadingLeft(false)
        getPaymentDetails();
    }

    const releaseFunds = async () => {
        setLoadingRight(true);

        const {escrowContract, receiverContract, tokenId, metadata} = paymentDetails;
        let skillHash = "";

        let skillObj = metadata.skills;
        for(let i=0; i < Object.keys(paymentDetails?.metadata?.skills).length; i++){
            const key = Object.keys(paymentDetails?.metadata?.skills)[i];
            skillObj[key] = rating;
        }
        skillHash = await saveToIPFS(skillObj)

        let contract = new web3.eth.Contract(EscrowABI, escrowContract);
        let method = await contract.methods.releaseFunds(receiverContract, tokenId, skillHash);
        await estimateAndExecute(smartAccount, method, escrowContract);

        setLoadingRight(false);
        getPaymentDetails();
    }

    const submitDelivery = async (e) => {
        setLoadingRight(true)
        const {escrowContract, receiverContract, tokenId} = paymentDetails;

        const delivery = await uploadDeliveres(e, web3, {
            escrow:  escrowContract,
            agreement: receiverContract,
            agreementId: tokenId
        }, (o) => {})

        const contract = new web3.eth.Contract(EscrowABI, escrowContract);
        const submitdelivery = await contract.methods.submitDelivery(receiverContract, tokenId, delivery);
        
        await  estimateAndExecute(smartAccount, submitdelivery, escrowContract);
        setLoadingRight(false)
        getPaymentDetails();
    }

    const isCreator = () => {
        return paymentDetails.mode? paymentDetails.receiverWallet == wallet : paymentDetails.senderWallet == wallet;
    }

    const isSender = () => {
        return paymentDetails.senderWallet == wallet
    }

    const isReceiver = () => {
        return paymentDetails.receiverWallet == wallet
    }

    const hasNoCondition = () => {
        return !paymentDetails.ipfsHash && !paymentDetails.skillHash
    }

    const currentStatus = () => {
        return parseInt(OnChainPaymentDetails.status || paymentDetails.status)
    }

    const actionCondition = () => {
        switch(currentStatus() || 0){
            case 0:
                return (<div className="btn-foot-msg">Payment is getting processed.</div>)
                break;
            case CREATED:
                return (<div className="btn-foot">
                            <div className="btn bottom-left" onClick={rejectPaymentProposal}>
                                {loadingLeft ? loader() : "Reject"}
                            </div>
                            {!isCreator() && <div className="btn bottom-right" onClick={acceptPaymentProposal}>
                                {loadingRight ? loader() : "Accept"}
                            </div> }
                        </div>)
                break;
            case SIGNED:
                return (<div className="btn-foot">
                            <div className="btn bottom-right" onClick={raiseDispute}>
                                {loadingLeft ? loader() : "Dispute"}
                            </div>
                        </div>)
                break;
            case CANCELLED:
                return (<div className="btn-foot-msg">
                            <div>Payment is cancelled</div>
                        </div>)
                break;
            case DELIVERD:
                return (<div className="btn-foot">
                            <div className="btn bottom-left" onClick={raiseDispute}>
                                {loadingLeft ? loader() : "Dispute"}
                            </div>
                            {isSender() &&  <div className="btn bottom-right" onClick={releaseFunds}>
                                {loadingRight ? loader() : "Release Funds"}
                            </div>}
                        </div>)
                break;
            case RELEASED:
                return (<div className="btn-foot-msg">
                            <div class="circle">
                                <div class="checkmark"></div>
                            </div>
                            <div>Payment successfully sent</div>
                        </div>)
                break;
            case DISPUTED:
                return (<div className="btn-foot-msg">
                            <div>A dispute is been raised, we are working on it.</div>
                        </div>)
                break;
            case DISPUTE_RESOLVED_BOTH_WON:
                return (<div className="btn-foot-msg">
                            <div>Dispute resolved: Both parties have got their share</div>
                        </div>)
                break;
            case DISPUTE_RESOLVED_CLIENT_WON:
                return (<div className="btn-foot-msg">
                            <div>Dispute resolved: Sender has got his funds back</div>
                        </div>)
                break;
            case DISPUTE_RESOLVED_SERVICE_WON:
                return (<div className="btn-foot-msg">
                            <div>Dispute resolved: Receiver has got his funds</div>
                        </div>)
                break;
        }
    }

    const getStatusClass = () => {
        switch(currentStatus()){
            case CANCELLED:
                return "cancelled"
                break;
            case RELEASED:
                return "released"
                break;
            case DISPUTED:
                return "disputed"
                break;
            case DISPUTE_RESOLVED_BOTH_WON:
                return "disputed"
                break;
            case DISPUTE_RESOLVED_CLIENT_WON:
                return "disputed"
                break;
            case DISPUTE_RESOLVED_SERVICE_WON:
                return "disputed"
                break;
        }
    }

    const addNewSkill = (e) => {
        const key = e.target.value.slice(-1);;
        const trimmedInput = input.trim();
      
        if (key === ',' && trimmedInput.length && !skills.includes(trimmedInput)) {
          e.preventDefault();
          setSkills(prevState => [...prevState, trimmedInput]);
          setInput('');
        }else{
            setInput(e.target.value);
        }
    };

    const removeSkill = (index) => {
        let c_tags = Array.from(skills);
        c_tags.splice(index, 1);
        setSkills(c_tags)
    }

    const loader = () => {
        return (<div className="btn-loader">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>);
    }

    return (
        <div className="container mh-100">
            {detailsLoading && <><div className="lds-ring"><div></div><div></div><div></div><div></div></div></>}
            {paymentDetails.amount && <>
                <div className={getStatusClass()}>
                    <div className="transaction">
                        <div className="amount">${paymentDetails.amount}</div>
                        <div className="payment">
                            <div className="userone">{paymentDetails.senderEmail || paymentDetails.senderWallet}</div>
                            <i className="arrow right"></i>
                            <div className="userone">{paymentDetails.receiverEmail || paymentDetails.receiverWallet}</div>
                        </div>
                    </div>
                    <div className="pbflex">
                        <div className="payment-details">
                            <div className="conditions">
                                {hasNoCondition() && <div className="head">No Conditions</div>}
                                {paymentDetails?.metadata?.conditions && Object.keys(paymentDetails?.metadata?.conditions).map((condition, index) => (
                                    <div className="condition">
                                        <div className="head">{condition}</div>
                                        <p>{paymentDetails?.metadata?.conditions[condition]}</p>
                                    </div>
                                ))}
                                {paymentDetails?.metadata?.skills && Object.keys(paymentDetails?.metadata?.skills).length > 0 &&
                                    <div className="condition">
                                        <div className="head">Skills</div>
                                        <p>
                                        {Object.keys(paymentDetails?.metadata?.skills).map((skill, index) => (
                                            <span>#{skill} </span>
                                        ))}
                                        </p>
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="payment-details conversion">
                            <div>
                                1 USD = Rs 84
                            </div>
                        </div>
                    </div>
                    <br /><br />
                    {currentStatus() == DELIVERD && (isSender() || isReceiver) && !hasNoCondition() &&
                        <div className="delivery">
                            A file is been attached, Click on Dowanlod <div className="btn small">Download</div>
                        </div>
                    }
                    {currentStatus() == DELIVERD && isSender() && !hasNoCondition() &&
                        <div className="delivery">
                            Rate before releasing funds
                            <div class="rate">
                                <input type="radio" id="star5" name="rate" value="5" onChange={(e) => setRating(e.target.value)}/>
                                <label for="star5" title="text">5 stars</label>
                                <input type="radio" id="star4" name="rate" value="4" onChange={(e) => setRating(e.target.value)}/>
                                <label for="star4" title="text">4 stars</label>
                                <input type="radio" id="star3" name="rate" value="3" onChange={(e) => setRating(e.target.value)}/>
                                <label for="star3" title="text">3 stars</label>
                                <input type="radio" id="star2" name="rate" value="2" onChange={(e) => setRating(e.target.value)}/>
                                <label for="star2" title="text">2 stars</label>
                                <input type="radio" id="star1" name="rate" value="1" onChange={(e) => setRating(e.target.value)} />
                                <label for="star1" title="text">1 star</label>
                            </div>
                        </div>
                    }
                    {currentStatus() == CREATED && isReceiver() && !hasNoCondition() &&
                        <div className="delivery">
                            <div className={"metadata invert "} onClick={() => setIsModalOpen(true)}>Add Skills</div>
                            <p>
                                {skills.map((skill, index) => (
                                    <span>#{skill} </span> 
                                ))}
                            </p>
                        </div>
                    }
                    {(currentStatus() == SIGNED || currentStatus() == DELIVERD )&& isReceiver() &&
                        <div className="delivery">
                            Please upload your file once you are ready for delivery
                            <div className="btn small">
                                <input type="file" onChange={(e) => submitDelivery(e)} accept=".zip" />
                                {loadingRight ? loader() : "Upload Zip"}
                            </div>
                        </div>
                    }
                    {statusLoading ? <><div className="lds-ring"><div></div><div></div><div></div><div></div></div></> : actionCondition()}

                    {paymentDetails.status == "" && !paymentDetails.hash && isCreator() && 
                        <div className="btn-foot">
                            <div className="btn bottom-left" onClick={rejectOffchainProposal}>
                                {loadingLeft ? loader() : "Reject"}
                            </div>
                        </div>
                    }
                </div>

                <Modal type="single-input" isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)}>
            
                    <div className="note">SKILLS</div>
                    
                    <div className="address-box">
                        <input type="text" disabled={skills.length >= 2} value={input}  placeholder="ReactJs" onChange={addNewSkill} autoFocus/>
                    </div>
                    
                    <p className="notify">Seprated by comma (","). Click to delete.</p>
                    <div className="buttonGroup">
                        {skills.map((skill, index) => <div className="tag" onClick={() => removeSkill(index)}>{skill}</div>)}
                    </div>
                </Modal>
                {!paymentDetails.hash && user && !user.isEmailVerified && 
                    <VerifyEmail
                        onClose={() => navigate("/")}
                        callback={createPaymentOnChain} />
                }
                {!paymentDetails.hash && !isCreator() && user && user.isEmailVerified && 
                    <PaymentOnChain
                        onClose={() => navigate("/")}
                        callback={createPaymentOnChain} />
                }
            </>}
        </div>
    )
}