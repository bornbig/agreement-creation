import { useSelector } from "react-redux";
import "./style.css";

export function Notification(props){
    const { isNotificationActive, message, type } = useSelector((state) => state.notification);

    const className = type == "danger" && " danger";

    return (
        <>
            {isNotificationActive && <div className={"notification " + className}>{message}</div> }
        </>
    )
}