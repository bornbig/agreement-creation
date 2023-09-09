import { useEffect, useState } from "react";
import { useDispatch, useSelector  } from "react-redux";
import { showNotification } from "../../store/actions/notification-action";
import { Navigate} from "react-router-dom";
import { useParams } from "react-router-dom";
import EscrowABI from "../../data/abi/Escrow.json";
import ERC20ABI from "../../data/abi/ERC20.json";
import "./style.css"
import { Skills } from "./skills";
import { getUSDTBalance } from "../../store/actions/user-action";
import { storeSkills } from "../../store/actions/agreement-action";
import { Modal } from "../modal";

export function SignAgreement (props){
    const dispatch = useDispatch();
    const { wallet, web3, isConnected } = useSelector((state) => state.user);
    const [allowance, setAllowance] = useState(0);
    const [allowanceLoading, setallowanceLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [signLoading, setSignLoading] = useState(false);
    const [skills, setSkills] = useState([]);
    let params = useParams();

    useEffect(() => {
        checkIfAmountApproved();
    }, [web3, wallet]);

    const checkIfAmountApproved = async () => {
        let contract = new web3.eth.Contract(ERC20ABI, props.details.token);

        let approvedAmount = await contract.methods.allowance(wallet, props.escrowAddress).call();
        
        setAllowance(approvedAmount);
    }

    const approveTokens = async () => {
        try {
            setallowanceLoading(true);
        let contract = new web3.eth.Contract(ERC20ABI, props.details.token);

        let approved = await contract.methods.approve(props.escrowAddress, props.details.price).send({from: wallet});

            if(approved){
                setAllowance(props.details.price);
            }
        } catch (e) {
            console.log(e)
            dispatch(showNotification("Please try again", dispatch));
        }
        setallowanceLoading(false)
    }


    const signAndProceed = async () => {
        try{
            setSignLoading(true);
                
                let skills_hash = "";
                if(!props.details.mode){
                skills_hash = await storeSkills(skills);
                }

                const contract = new web3.eth.Contract(EscrowABI, props.escrowAddress);
                await contract.methods.signAgreement(props.agreementAddress, params.id, skills_hash).send({from: wallet});

        } catch(e){
            console.log(e);
            dispatch(showNotification("Please try again", dispatch));
        }

        props.refresh();
        setSignLoading(false);
    }

    const rejectByClient = async () => {
        setCancelLoading(true);
        const contract = new web3.eth.Contract(EscrowABI, props.escrowAddress);
        await contract.methods.cancelAgreement(props.agreementAddress, params.id).send({from: wallet});
        props.refresh();
        setCancelLoading(false);
    }

    const rejectByServiceProvider = async () => {
        setCancelLoading(true);
        const contract = new web3.eth.Contract(EscrowABI, props.escrowAddress);
        await contract.methods.rejectAgreement(props.agreementAddress, params.id).send({from: wallet});
        props.refresh();
        setCancelLoading(false);
    }

    return (
        <div>
            {isConnected && wallet?.toLowerCase() == props.details?.client?.toLowerCase() && (
                <div className="flexBetween">
                    {props.details?.mode &&
                        ((allowance < props.details?.price)? 
                            (<div className="btn withPadding" onClick={() => !allowanceLoading && approveTokens()}>
                                Approve Tokens and Sign 
                            </div>
                            )
                        :
                            (
                            <div className="btn withPadding withMargin" onClick={() => !signLoading && signAndProceed()}>
                                {signLoading && <div className="loading"><div className="bar"></div></div>}
                                Sign & Proceed
                            </div>
                        )
                        )
                    }
                    <div className="btn withPadding withMargin cancel" onClick={() => !cancelLoading && rejectByClient()}>
                        {cancelLoading && <div className="loading"><div className="bar"></div></div>}
                        Cancel
                    </div>
                </div>
            )} 
            
            {isConnected && wallet?.toLowerCase() == props.details?.service_provider?.toLowerCase() && (
                <>
                    {!props.details?.mode && <Skills skills={skills} setSkills={setSkills} />}
                    <div className="flexBetween">
                        {!props.details?.mode &&
                         <div className="btn withPadding withMargin" onClick={() => !signLoading && signAndProceed()}>
                            {signLoading && <div className="loading"><div className="bar"></div></div>}
                            Sign & Proceed
                            </div>
                            }
                        <div className="btn withPadding withMargin cancel" onClick={() => !cancelLoading && rejectByServiceProvider()}>
                            {cancelLoading && <div className="loading"><div className="bar"></div></div>}
                            Cancel
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}