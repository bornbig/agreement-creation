import { combineReducers } from "redux";
import notificationReducer from "./notification-reducer";
import userReducer from "./user-reducer";

// Aggregating all the reducers defined 
const rootReducer = combineReducers({
    user: userReducer,
    notification: notificationReducer
});

export default rootReducer; 