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
                            <button id="btn1" className={props.activeModel === "Agreement" ? "active" : ""}
                                    onClick={() => props.setActiveModel("Agreement")} >Agreement</button>
                            <button id="btn2" 
                            className={props.activeModel === "Payment" ? "active" : ""} 
                                    onClick={() => props.setActiveModel("Payment")}
                                    >Payment</button>
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