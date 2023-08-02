import { SHOW_NOTIFICATION, HIDE_NOTIFICATION } from "../actions/notification-action";

const initialState = {
    isNotificationActive: false,
    message: "",
  };
  
export default function (state = initialState, action) {
    switch (action.type) {
        case SHOW_NOTIFICATION:
            return {
                ...state,
                isNotificationActive: true,
                message: action.data.message
            }
        case HIDE_NOTIFICATION:
            return {
                ...state,
                isNotificationActive: false,
                message: ""
            }
        default:
            return state;
    }
}