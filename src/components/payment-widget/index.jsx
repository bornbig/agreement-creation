import { useEffect, useState } from "react";
import { Modal } from "../modal";
import { createPayment, saveToIPFS } from "../../store/actions/payment-action";
import { useSelector } from "react-redux";
import "./style.css";
import { CONTRACT } from "../../config/config";
import ERC20ABI from "../../data/abi/ERC20.json";
import { estimateAndExecute } from "../../helpers/utils";
import { useNavigate } from "react-router-dom";
import { VerifyEmail } from "../verify-email";
import { sendEmailCode } from "../../store/actions/user-action";

export function PaymentWidget(){
    const navigate = useNavigate();
    const [needCondition, setNeedCondition] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeModal, setActiveModal] = useState("");
    const [isEmailVerifierOpen, setIsEmailVerifierOpen] = useState(false)
    const [conditions, setCoditions] = useState(["Reason", "Deadline", "Deliverible", "Skill"])
    const [input, setInput] = useState('');
    const [reason, setReason] = useState('');
    const [deadline, setDeadline] = useState('');
    const [deliverables, setDeliverables] = useState('');
    const [skills, setSkills] = useState([]);
    const [toUser, setToUser] = useState('');
    const [amount, setAmount] = useState('');
    const [mode, setMode] = useState(false);
    const [placeholder, setPlaceholder] = useState(null);
    const [isSendLoading, setIsSendLoading] = useState(false);
    const [isReceiveLoading, setIsReceiveLoading] = useState(false);
    const { userInfo, user, wallet, web3, smartAccount } = useSelector((state) => state.user);

    const openModal = (condition) => {
        setIsModalOpen(true);
        setActiveModal(condition)
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

    const checkIfConditionUsed = (condition) => {
        if(condition == conditions[0] && reason != ""){
            return "active"
        }else if(condition == conditions[1] && deadline != ""){
            return "active"
        }else if(condition == conditions[2] && deliverables != ""){
            return "active"
        }else if(condition == conditions[3] && skills.length != 0){
            return "active"
        }
        return "no"
    }

    const preHandleAndReceive = async (mode) => {
        setMode(mode);
        if(!user.isEmailVerified){
            // let _accounts = await web3.eth.getAccounts();
            // const signedMessage = await web3.eth.personal.sign(userInfo.email, _accounts[0]);
            // await sendEmailCode(userInfo.email, signedMessage)
            setIsEmailVerifierOpen(true);
            return null;
        }

        handleSendReceive(mode);
    }

    const handleSendReceive = async (mode) => {

        if(isReceiveLoading || isSendLoading){ return null; }
        mode? setIsReceiveLoading(true) : setIsSendLoading(true);
        try{
            const message = wallet;
            let _accounts = await web3.eth.getAccounts();
            const signature = await web3.eth.personal.sign(message, _accounts[0]);

            let skillObj = {};
            for(let i = 0; i < skills.length; i++){
                skillObj = {...skillObj, [skills[i]]: null}
            }

            let metadata = {};
            if(reason != '') metadata = {...metadata, reason};
            if(deadline != '') metadata = {...metadata, deadline};
            if(deliverables != '') metadata = {...metadata, deliverables};
            
            const ipfsHash = (Object.keys(metadata).length == 0)? null : await saveToIPFS(metadata)
            const skillHash = (skills.length == 0)? null : await saveToIPFS(skillObj)

            if(!mode){
                let erc20Contract = new web3.eth.Contract(ERC20ABI, CONTRACT["0x89"].tokens[0].contract);
                let method = erc20Contract.methods.approve(CONTRACT["0x89"].escrow.contract, amount);
                await estimateAndExecute(smartAccount, method, CONTRACT["0x89"].tokens[0].contract);
            }

            const payment = await createPayment({ message, signature, user: toUser, mode, ipfsHash, skillHash, amount })
            navigate(`/payment/${payment.paymentid}`)
        }catch(e){
            console.log(e);
        }

        mode? setIsReceiveLoading(false) : setIsSendLoading(false);
    }

    const delay = (delayInms) => {
        return new Promise(resolve => setTimeout(resolve, delayInms));
    };

    const typeTextInPlaceholder = async (text) => {
        for(let i = 0; i <= text.length; i++){
            const subStr = text.substring(0, i)
            setPlaceholder(subStr);
            await delay(160)
        }
    }

    window.t = null;
    const updateEmail = () => {
        console.log("called")
        const placeholders = ["abhishek@woople.io", "rupak@woople.io", "elon@musk.x", "john.cena@wwe.io"]
        const random = Math.floor(Math.random() * (placeholders.length));
        
        typeTextInPlaceholder(placeholders[random])
        // window.t = setTimeout(updateEmail, 200 * placeholders[random].length)
    }

    useEffect(() => {
        if(!window.t){
            updateEmail();
        }
        window.t = true;
    }, [])

    const loader = () => {
        return (<div className="btn-loader">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>);
    }

    return (
        <>
            <div className={"modal embeded " + (needCondition && "exp")}>
                <div className="contract-creation">
                    <div className="note">EMAIL / WALLET ADDRESS</div>
                    <div className="address-box">
                        <input type="text" value={toUser} onChange={(e) => setToUser(e.target.value)} placeholder={placeholder} autoFocus/>
                    </div>

                    <div className="note">AMOUNT</div>
                    <div className="price-box">
                        <div className="dollar">$</div>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="fiat-text no-spinner"/>
                    </div>

                    <div className={"expand " + (needCondition && " active")} onClick={() => setNeedCondition(!needCondition)}>WITH{needCondition && "OUT"} Conditions <i className={"arrow " + (needCondition? "up o" : "down i")}></i></div>

                    <div className="clear"></div>
                    <div className="section2">
                        <p className="notify">Select one or more coditions needs to be satisfied to complete this transaction.</p>
                        <div className="buttonGroup">
                            {conditions.map((condition, index) => (
                                <div className={"metadata invert " + checkIfConditionUsed(condition)} onClick={() => openModal(condition)}>{condition}</div>
                            ))}
                        </div>
                    </div>
                </div> 
                <div className="btn bottom-left" onClick={() => preHandleAndReceive(true)}>
                    {isReceiveLoading ? loader() : "RECEIVE"}
                </div>
                <div className="btn bottom-right" onClick={() => preHandleAndReceive(false)}>
                    {isSendLoading ? loader() : "SEND"}
                </div>
            </div>

            <Modal type="single-input" isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)}>
                {activeModal == conditions[0] &&
                    <div className="contract-creation">
                        <div className="note">REASON</div>
                        <div className="agreement-details">
                            <textarea value={reason}  onChange={(e) => setReason(e.target.value)} autoFocus></textarea>
                        </div>
                    </div>
                }
                {activeModal == conditions[1] &&
                    <>
                        <div className="note">DEADLINE</div>
                        <div className="price-box">
                            <input type="number" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="no-spinner" autoFocus/>
                            <div className="token-drop-down">
                                <select className="drop-down-list">
                                    <option className={"item "}>Days</option>
                                    <option className={"item " }>Hours</option>
                                    <option className={"item " }>Minutes</option>
                                </select>
                            </div>
                        </div>
                    </>
                }
                {activeModal == conditions[2] &&
                    <>
                        <div className="note">DELIVERIBLES</div>
                        <div className="address-box">
                            <input type="text" value={deliverables} onChange={(e) => setDeliverables(e.target.value)} placeholder=".AI File" autoFocus/>
                        </div>
                    </>
                }
                {activeModal == conditions[3] &&
                    <>
                        <div className="note">SKILLS</div>
                        
                        <div className="address-box">
                            <input type="text" disabled={skills.length >= 2} value={input}  placeholder="ReactJs" onChange={addNewSkill} autoFocus/>
                        </div>
                        
                        <p className="notify">Seprated by comma (","). Click to delete.</p>
                        <div className="buttonGroup">
                            {skills.map((skill, index) => <div className="tag" onClick={() => removeSkill(index)}>{skill}</div>)}
                        </div>
                    </>
                }
            </Modal>
            {isEmailVerifierOpen && <VerifyEmail callback={() => handleSendReceive(mode)} onClose={() => setIsEmailVerifierOpen(false)}/>}
        </>
    )
}