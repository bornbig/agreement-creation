export function AgreementDetails(props){
    return (
        <>
            <div className="contract-creation">
                <div className="question">
                    Please enter the details of the agreement.
                </div>
                <div className="note">( Ex: This agreement is to create a 3D logo for Google. )</div>

                <div className="agreement-details">
                    <textarea onChange={(e) => props.setDetails(e.target.value)} value={props.details}></textarea>
                </div>

                <div className="btn bottom-left" onClick={() => props.nextStep(props.step - 1)}>Previous</div>
                <div className={"btn bottom-right " + (!props.details && " disabled")} onClick={() => props.nextStep(props.step + 1)}>Next</div>
            </div> 
        </>
    )
}