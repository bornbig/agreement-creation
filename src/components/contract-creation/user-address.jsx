export function UserAddress(props){
    return (
        <>
          <div className="contract-creation">
                <div className="question">
                    You are the {props.userType == 1 && "Service Provider"}{props.userType == 2 && "Client"}, Please enter the wallet address of 
                    {props.userType == 2 && " Service Provider"} {props.userType == 1 && "Client"}
                </div>
                <div className="note">( Please take wallet address from the second party. )</div>
                {props.userType == 1 && (
                    <div className="address-box">
                        <input type="text" onChange={(e) => props.setClient(e.target.value)} value={props.client} />
                    </div>
                )}
                {props.userType == 2 && (
                    <div className="address-box">
                        <input type="text" onChange={(e) => props.setServiceProvider(e.target.value)} value={props.serviceProvider} />
                    </div>
                )}

                <div className="btn bottom-left" onClick={() => props.nextStep(props.step - 1)}>Previous</div>
                <div className="btn bottom-right" onClick={() => props.nextStep(props.step + 1)}>Next</div>
            </div> 
        </>
    )
}