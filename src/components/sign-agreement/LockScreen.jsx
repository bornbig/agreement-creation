import "./style.css"

export function LockScreen(){
    return(
        <div className="lockscreen">
            <p>This content is accessible to logged-in members only.</p>
            <img src="https://cdn-icons-png.flaticon.com/512/9370/9370116.png" alt="Lock"/>
            <p>Please login to gain access.</p>
        </div>
        
    )
}