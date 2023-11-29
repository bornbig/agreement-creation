import { useState } from "react";
import { Modal } from "../modal";

export function PaymentOnChain(props){
    const [confirmLoading, setConfirmLoading] = useState(false);

    const proceed = () => {
        setConfirmLoading(true)
        props.callback();
        setConfirmLoading(false)
    }

    const loader = () => {
        return (<div className="btn-loader">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>);
    }

    return (
        <Modal type="single-input" isOpen={true} closeModal={props.onClose}>
            <div className="note">Nothing to worry</div>
            <div className="note">The payment receipt is not ready yet. Click on confirm and wait for it to get ready.</div>
            <div className="btn btn-absolute" onClick={proceed}>
                {confirmLoading ? loader() : "PROCEED"}
            </div>
        </Modal>
    )
}