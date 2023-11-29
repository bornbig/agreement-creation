import { combineReducers } from "redux";
import notificationReducer from "./notification-reducer";
import userReducer from "./user-reducer";
import paymentReducer from "./payment-reducer";

// Aggregating all the reducers defined 
const rootReducer = combineReducers({
    user: userReducer,
    notification: notificationReducer,
    payment: paymentReducer
});

export default rootReducer; 