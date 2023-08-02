import "./style.css"

export function Modal(props){
    return (
        <>
        {props.isOpen && (
            <>
                <div className="mask" onClick={() => props.closeModal(false)}></div>
                <div className={'modal ' + (props.big && "big")}>
                    <div className="modal-head">
                        <div className="close" onClick={() => props.closeModal(false)}>x</div>
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