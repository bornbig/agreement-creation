import { useState, useEffect } from "react"
import { getUserWallet } from "../../store/actions/user-action"
import Web3 from "web3";
import { showNotification } from "../../store/actions/notification-action";
import { useDispatch } from "react-redux";


export function UserAddress(props){
    const dispatch = useDispatch();

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
            dispatch(showNotification("Please try again", dispatch));
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
                    As the {props.userType == 1 && "Service Provider"}{props.userType == 2 && "Client"}, kindly provide the email address or wallet address of the  
                    {props.userType == 2 && " Service Provider."} {props.userType == 1 && "Client."}
                </div>
                <div className="note">(Please obtain this information from the second party.)</div>

                    <div className="address-box">
                        <input type="text" onChange={(e) => updateUserWalletByEmail(e.target.value)} value={props.userInput} />
                    </div>
                    {props.userInput != getUserWalletText() &&
                        <div className="note success">{(props.client && props.serviceProvider) && <><p className="heading-success">Address- </p><p className="text-success-add"> {props.userType == 1 ? props.client : props.serviceProvider}</p> </>}</div>
                    }

                <div className="btn bottom-left" onClick={() => props.nextStep(props.step - 1)}>Previous</div>
                <div className={"btn bottom-right " + (!isValidInput && "disabled")} onClick={() => props.nextStep(props.step + 1)}>{props.nextLoading && <div className="loading"><div className="bar"></div></div>}Next</div>
            </div> 
        </>
    )
}