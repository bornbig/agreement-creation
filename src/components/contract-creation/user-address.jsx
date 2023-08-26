import { useState, useEffect } from "react"
import { getUserWallet } from "../../store/actions/user-action"
import Web3 from "web3";

export function UserAddress(props){

    const [isValidInput, setIsValidInput] = useState(false);

    useEffect(() => {
        updateValidInput(props.userInput);
    }, []);

    const updateUserWalletByEmail = async (value) => {
        try{
            props.setUserInput(value);
            updateValidInput(value);
            props.setNextLoading(true)
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
        }catch(e){
            console.log(e);
        }

        props.setNextLoading(false)
    }

    const updateValidInput = (value) => {
        if(value.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ) || Web3.utils.isAddress(value)){
            setIsValidInput(true)
          }else{
            setIsValidInput(false)
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
                        <input type="text" onChange={(e) => updateUserWalletByEmail(e.target.value)} value={props.userInput} />
                    </div>
                    {props.userInput != getUserWalletText() &&
                        <div className="note success">{props.userType == 1 ? props.client : props.serviceProvider}</div>
                    }

                <div className="btn bottom-left" onClick={() => props.nextStep(props.step - 1)}>Previous</div>
                <div className={"btn bottom-right " + (!isValidInput && "disabled")} onClick={() => props.nextStep(props.step + 1)}>{props.nextLoading && <div className="loading"><div className="bar"></div></div>}Next</div>
            </div> 
        </>
    )
}