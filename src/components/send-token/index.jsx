import { useState } from "react";
import { Modal } from "../modal";
import "./style.css"
import { sendToken } from "../../store/actions/user-action";
import { useDispatch, useSelector } from "react-redux";
import { CONTRACT } from "../../config/config";
import { showNotification } from "../../store/actions/notification-action";

export function SendToken(props){
    const dispatch = useDispatch();
    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState(0);
    const { wallet, web3, chainId, userInfo, balance } = useSelector((state) => state.user);

    const sendUSDT = async () => {
        try {
            await sendToken(web3, CONTRACT[chainId]?.tokens[0].contract, toAddress, amount);
            dispatch(showNotification("Successfully sent!", dispatch));

        } catch(e) {
            dispatch(showNotification("Invalid Input", dispatch, "danger"));
        }
    }

    const checkInputfield = () => {
        if ((amount > balance.humanReadable || amount == 0)) {
            return " disabled"
        }
        if (toAddress.length != 42){
            return " disabled"
        }
        return "";
    }

    return (
        <>
        <Modal big={true} isOpen={props.isOpen} closeModal={props.closeModal}>
            <div className="send-token">
                <div className="balance">
                    ${balance.usdBalance} <div>{balance.humanReadable} USDT</div>
                </div>

                <div className="input">
                    <input type="text" onChange={(e) => setAmount(e.target.value)} placeholder="100" autoFocus/>
                </div>

                <div className="input">
                    <input type="text" onChange={(e) => setToAddress(e.target.value)} placeholder="0x6F5d0Fd24566a5DfDce22f1fCD595Bdb7d4D07D8" />
                </div>

                <div className={"btn bottom " + checkInputfield()} onClick={sendUSDT}>Send</div>
            </div>
        </Modal>
        </>
    )
}