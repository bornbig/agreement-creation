import { useEffect, useState } from "react";
import { useDispatch, useSelector  } from "react-redux";
import { showNotification } from "../../store/actions/notification-action";
import { useParams } from "react-router-dom";
import EscrowABI from "../../data/abi/Escrow.json";
import ERC20ABI from "../../data/abi/ERC20.json";
import "./style.css"
import { Skills } from "./skills";
import { storeSkills } from "../../store/actions/agreement-action";
import transakSDK from '@transak/transak-sdk';
import { estimateAndExecute } from "../../helpers/utils";

export function SignAgreement (props){
    const dispatch = useDispatch();
    const { wallet, web3, isConnected, userInfo, balance } = useSelector((state) => state.user);
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

            let approved = await contract.methods.approve(props.escrowAddress, props.details.price);

            await estimateAndExecute(web3, approved, wallet)

            if(approved){
                setAllowance(props.details.price);
            }
        } catch (e) {
            if(e == "GASFEE_ERROR"){
                dispatch(showNotification("Gas Fee Error", dispatch, "danger"));
            }else{
                console.log(e)
                dispatch(showNotification("Unable to Approve Token: Insufficient Gas Fee", dispatch, "danger"));
            }
        }
        setallowanceLoading(false)
    }


    const signAndProceed = async () => {
        try{
            setSignLoading(true);

            (allowance < props.details?.price) && await approveTokens();

            let skills_hash = "";
            if(!props.details.mode){
                skills_hash = await storeSkills(skills);
            }

            const contract = new web3.eth.Contract(EscrowABI, props.escrowAddress);
            const signagreement = await contract.methods.signAgreement(props.agreementAddress, params.id, skills_hash);

            await estimateAndExecute(web3, signagreement, wallet)

        } catch(e){
            if(e == "GASFEE_ERROR"){
                dispatch(showNotification("Gas Fee Error", dispatch, "danger"));
            }else{
            console.log(e);
                dispatch(showNotification("Unable to Sign agreement", dispatch, "danger"));
            }
        }

        props.refresh();
        setSignLoading(false);
    }

    const rejectByClient = async () => {
        setCancelLoading(true);
        const contract = new web3.eth.Contract(EscrowABI, props.escrowAddress);
        try {
            const cancelagreement = await contract.methods.cancelAgreement(props.agreementAddress, params.id);

            await estimateAndExecute(web3, cancelagreement, wallet)

            props.refresh();

        } catch(e){
            if(e == "GASFEE_ERROR"){
                dispatch(showNotification("Gas Fee Error", dispatch, "danger"));
            }else{
                dispatch(showNotification("Unable to Cancel", dispatch, "danger"));
                console.log(e)
            }
        }
        setCancelLoading(false);
    }

    const rejectByServiceProvider = async () => {
        setCancelLoading(true);
        const contract = new web3.eth.Contract(EscrowABI, props.escrowAddress);
        console.log(props.agreementAddress);
        try {
            const rejectagreement = await contract.methods.rejectAgreement(props.agreementAddress, params.id);

            await estimateAndExecute(web3, rejectagreement, wallet)

            props.refresh();
            
        } catch (e) {
            if(e == "GASFEE_ERROR"){
                dispatch(showNotification("Gas Fee Error", dispatch, "danger"));
            }else{
                dispatch(showNotification("Unable to Cancel", dispatch, "danger"));
                console.log(e)
            }
        }
        setCancelLoading(false);
    }

    const addFunds = async () => {
        //default Crypto amount is wrong
        let transak = new transakSDK({
            apiKey: 'a7193b71-7510-4225-9df0-c3e31343577b', // (Required)
            environment: 'STAGING', // (Required)
            network: 'polygon',
            cryptoCurrencyCode: "USDT",
            productsAvailed: "BUY",
            fiatCurrency: "USD",
            defaultCryptoAmount	: props.details.price,
            defaultPaymentMethod: "pm_jwire",
            widgetHeight: "80%",
            walletAddress: wallet,
            email: userInfo.email
        });
          
        transak.init();
    }

    return (
        <div>
            {/** If Client needs to sign */}
            {isConnected && wallet?.toLowerCase() == props.details?.client?.toLowerCase() && (
                <div className="flexBetween">
                    {props.details?.mode &&
                        ((balance.raw >= props.details.price) ?
                           (<div className="btn withPadding withMargin" onClick={() => !signLoading && signAndProceed()}>
                                {signLoading && <div className="loading"><div className="bar"></div></div>}
                                Sign & Proceed
                            </div>)
                            :
                            <div className="btn withPadding" onClick={addFunds}>Add Funds</div>
                        )
                    }
                    <div className="btn withPadding withMargin" onClick={() => !cancelLoading && rejectByClient()}>
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
                        <div className="btn withPadding withMargin" onClick={() => !cancelLoading && rejectByServiceProvider()}>
                            {cancelLoading && <div className="loading"><div className="bar"></div></div>}
                            Cancel
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}