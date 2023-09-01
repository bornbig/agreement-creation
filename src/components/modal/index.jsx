import "./style.css"

export function Modal(props){
    return (
        <>
        {props.isOpen && (
            <>
                <div className="mask" onClick={() => props.closeModal(false)}></div>
                <div className={'modal ' + (props.big && "big")}>
                    <div className="modal-head">
                        <div className="toggle-btn">
                            <div className={"tab " + (props.activeModel === "Agreement" && "active" )}
                                    onClick={() => props.setActiveModel("Agreement")} >Agreement</div>
                            <div 
                            className={"tab " + (props.activeModel === "Payment" && "active")} 
                                    onClick={() => props.setActiveModel("Payment")}
                                    >Payment</div>
                        </div>
                        <div className="close" onClick={() => props.closeModal(false)}>X</div>
                    </div>
                    <div className="modal-content">
                    {props.children}
                    </div>
                    
                </div>
            </>
        )}
        </>
    )
}