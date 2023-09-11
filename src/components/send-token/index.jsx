import { useState } from "react";
import { Modal } from "../modal";
import "./style.css"
import { sendToken } from "../../store/actions/user-action";
import { useSelector } from "react-redux";
import { CONTRACT } from "../../config/config";

export function SendToken(props){
    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState(0);
    const { wallet, web3, chainId, userInfo, balance } = useSelector((state) => state.user);

    const sendUSDT = async () => {
        await sendToken(web3, CONTRACT[chainId]?.tokens[0].contract, toAddress, amount);
    }

    return (
        <>
        <Modal big={true} isOpen={props.isOpen} closeModal={props.closeModal}>
            <div className="send-token">
                <div className="balance">
                    $0.00 <div>{balance.humanReadable} USDT</div>
                </div>

                <div className="input">
                    <input type="text" onChange={(e) => setAmount(e.target.value)} placeholder="100" />
                </div>

                <div className="input">
                    <input type="text" onChange={(e) => setToAddress(e.target.value)} />
                </div>

                <div className="btn bottom" onClick={sendUSDT}>Send</div>
            </div>
        </Modal>
        </>
    )
}