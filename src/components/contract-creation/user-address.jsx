import { useState } from "react"
import { getUserWallet } from "../../store/actions/user-action"
import Web3 from "web3";

export function UserAddress(props){

    const [userInput, updateUserInput] = useState("")

    const updateUserWalletByEmail = async (value) => {
        updateUserInput(value);
        const wallet = await getUserWallet(value);
        if(Web3.utils.isAddress(wallet)){
            if(props.userType == 1){
                props.setClient(wallet);
            }else if(props.userType == 2){
                props.setServiceProvider(wallet);
            }
        }else{
            if(props.userType == 1){
                props.setClient("");
            }else if(props.userType == 2){
                props.setServiceProvider("");
            }  
        }
    }

    const getUserWalletText = () => {
        if(props.userType == 1){
            return props.client;
        }else if(props.userType == 2){
            return props.serviceProvider;
        }

        return "";
    }

    return (
        <>
          <div className="contract-creation">
                <div className="question">
                    You are the {props.userType == 1 && "Service Provider"}{props.userType == 2 && "Client"}, Please enter the wallet address of 
                    {props.userType == 2 && " Service Provider"} {props.userType == 1 && "Client"}
                </div>
                <div className="note">( Please take wallet address from the second party. )</div>

                    <div className="address-box">
                        <input type="text" onChange={(e) => updateUserWalletByEmail(e.target.value)} value={userInput} />
                    </div>
                    {userInput != getUserWalletText() &&
                        <div className="note success">{props.userType == 1 ? props.client : props.serviceProvider}</div>
                    }

                <div className="btn bottom-left" onClick={() => props.nextStep(props.step - 1)}>Previous</div>
                <div className={"btn bottom-right " + ((props.userType == 1 && !props.client || props.userType == 2 && !props.serviceProvider) && "disabled")} onClick={() => props.nextStep(props.step + 1)}>Next</div>
            </div> 
        </>
    )
}