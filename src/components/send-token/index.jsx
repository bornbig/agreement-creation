import { useState } from "react";
import { Modal } from "../modal";
import "./style.css"
import { sendToken } from "../../store/actions/user-action";
import { useDispatch, useSelector } from "react-redux";
import { CONTRACT } from "../../config/config";
import { showNotification } from "../../store/actions/notification-action";
import BigNumber from "bignumber.js";

export function SendToken(props){
    const dispatch = useDispatch();
    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState(0);
    const [sendLoading, setSendLoading] = useState(false);
    const { wallet, web3, chainId, userInfo, balance } = useSelector((state) => state.user);

    const sendUSDT = async () => {
        try {
            setSendLoading(true);
            const decimal = new BigNumber(10).pow(new BigNumber(CONTRACT[chainId]?.tokens[0].decimals));
            const bnAmount = new BigNumber(amount).mul(decimal).toString()
            await sendToken(web3, CONTRACT[chainId]?.tokens[0].contract, toAddress, wallet, bnAmount);
            dispatch(showNotification("Successfully sent!", dispatch));
            props.closeModal(false);
            props.triggerUpdateBalance(wallet)
        } catch(e) {
            console.log(e);
            dispatch(showNotification("Error while sending token", dispatch, "danger"));
        }
        setSendLoading(false);
    }

    const checkInputfield = () => {
        
        if ((amount > balance.humanReadable || amount == 0)) {
            return " disabled"
        }else if (toAddress.length != 42){
            return " disabled"
        }
        return "";
    }

    return (
        <>
        <Modal big={true} isOpen={props.isOpen} closeModal={props.closeModal}>
            <div className="send-token">
                <div className="balance">
                    ${balance.humanReadable} <div>{balance.humanReadable} USDT</div>
                </div>

                <div className="input">
                    <input type="number" className="no-spinner" onChange={(e) => setAmount(e.target.value)} placeholder="100" autoFocus/>
                </div>

                <div className="input">
                    <input type="text" onChange={(e) => setToAddress(e.target.value)} placeholder="0x6F5d0Fd24566a5DfDce22f1fCD595Bdb7d4D07D8" />
                </div>

                <div className={"btn bottom " + checkInputfield()} onClick={sendUSDT}>
                    {sendLoading && <div className="loading"><div className="bar"></div></div>}
                    Send
                </div>
            </div>
        </Modal>
        </>
    )
}