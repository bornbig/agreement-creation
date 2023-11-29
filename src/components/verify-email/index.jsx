import { useEffect, useState } from "react";
import { Modal } from "../modal";
import { sendEmailCode, verifyEmailCode } from "../../store/actions/user-action";
import { useSelector } from "react-redux";

export function VerifyEmail(props){
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [sendingMail, setSendingMail] = useState(false);
    const [otp, setOtp] = useState('');
    const { wallet, web3, smartAccount, userInfo, isConnected, chainId } = useSelector((state) => state.user);

    const confirmOTP = async () => {
        if(otp != ""){
            setConfirmLoading(true)
            let _accounts = await web3.eth.getAccounts();
            const signedMessage = await web3.eth.personal.sign(otp, _accounts[0]);
            const verificationResponse = await verifyEmailCode(otp, signedMessage);

            if(verificationResponse.isEmailVerified){
                await props.callback();
            }
            setConfirmLoading(false)
        }
    }

    const callSendOTP = async () => {
        setSendingMail(true);
        let _accounts = await web3.eth.getAccounts();
        const signedMessage = await web3.eth.personal.sign(userInfo?.email, _accounts[0]);

        await sendEmailCode(userInfo?.email, signedMessage)
        setSendingMail(false);
    }

    const loader = () => {
        return (<div className="btn-loader">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>);
    }

    return (
        <>
            <Modal type="single-input" isOpen={isModalOpen} closeModal={props.onClose}>
                <div className="note">OTP</div>
                <div className="price-box">
                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} autoFocus/>
                    <div className="btn-input" onClick={callSendOTP}>
                    {sendingMail ? loader() : "Send OTP"}
                    </div>
                </div>
                <div className="note">An email is been sent to you for verification, please enter the code above.</div>
                <div className="btn btn-absolute" onClick={confirmOTP}>
                    {confirmLoading ? loader() : "CONFIRM"}
                </div>
            </Modal>
        </>
    )
}