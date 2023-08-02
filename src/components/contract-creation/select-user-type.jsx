import { Modal } from "../modal";


export function SelectUserType(props){


    return (
        <div className="contract-creation">
            <div className="question">Please select your user type. I am</div>
            <div className="note">( Select Service Provider if you are providing service to a client. )</div>
            <div>
                <div className={"user-type " + ((props.userType == 1) && "selected")} onClick={() => props.setUserType(1)}>
                    Service Provider
                </div>
                <div className={"user-type " + ((props.userType == 2) && "selected")} onClick={() => props.setUserType(2)}>
                    Client
                </div>
            </div>
            <div className="btn bottom" onClick={() => props.nextStep(1)}>Next</div>
        </div>
    )
}