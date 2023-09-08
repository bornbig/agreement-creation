export function Deliverables(props){
    return (
        <>
            <div className="contract-creation">
                <div className="question">
                    What all quantifiable deliverables is promised by the end of this agreement.
                </div>
                <div className="note">( Ex: .PNG, .AI, .GIF Files or 100 Followers on Twitter @pentonium_ptm. )</div>

                <div className="address-box">
                    <input type="text" onChange={(e) => props.setDelivery(e.target.value)} value={props.delivery} />
                </div>

                <div className="btn bottom-left" onClick={() => props.nextStep(props.step - 1)}>Previous</div>
                <div className={"btn bottom-right " + (!props.delivery && "disabled")} onClick={() => props.nextStep(props.step + 1)}>Next</div>
            </div> 
        </>
    )
}