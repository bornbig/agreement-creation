import { useState } from "react";
import { Modal } from "../modal";

export function PrivateKeyModel(props){
    const [isPrivateKeyHidden, setIsPrivateKeyHidden] = useState(true);

    return (
        <Modal type="message-box" isOpen={props.isOpen} closeModal={props.closeModal}>
            <br />
            <div className="modal-title">Your Private Key</div>
            <div className="privateKey">
                <input type={ isPrivateKeyHidden ? "password" : "text"} value={props.privateKey} readOnly/>
                <div onClick={() => setIsPrivateKeyHidden(!isPrivateKeyHidden)}>
                    {isPrivateKeyHidden ? <img src="/images/hide.png" /> : <img src="/images/visible.png" />}
                </div>
            </div>

            <div className="danger">Please do not share your private key to any one, this would potentially give non reversible access/ownership of your account.</div>
            <br />
        </Modal>
    );
}

// aggregateVerifier: "tkey-google"
// appState: ""
// dappShare: ""
// email: "abhiaurhai@gmail.com"
// name: "Abhishek Tiwari"
// oAuthAccessToken: ""
// oAuthIdToken: ""
// profileImage: "https://lh3.googleusercontent.com/a/ACg8ocJL50bxBQBGKHG6TiUDjOMyLmZGwUQGP2M2IGK0fewj=s96-c"
// touchIDPreference: "unset"
// typeOfLogin: "google"
// verifier: "torus"
// verifierId: "abhiaurhai@gmail.com"