import { useSelector } from "react-redux";
import "./style.css";

export function Notification(props){
    const { isNotificationActive, message } = useSelector((state) => state.notification);

    return (
        <>
            {isNotificationActive && <div className="notification">{message}</div> }
        </>
    )
}