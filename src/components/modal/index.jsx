import "./style.css"

export function Modal(props){
    return (
        <>
        {props.isOpen && (
            <>
                <div className="mask" onClick={() => props.closeModal(false)}></div>
                <div className={'modal ' + (props.big && " big ") + (props.type == "message-box" && " message-box") }>
                    <div className="modal-head">
                        {props.header}
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