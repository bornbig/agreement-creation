import { UPDATE_AGREEMENT } from "../actions/payment-action";

const initialState = {
    agreements: {}
  };


export default function (state = initialState, action) {
    switch (action.type) {
        case UPDATE_AGREEMENT:
            return {
                ...state,
                agreements: {
                    ...state.agreements,
                    [action.data.agreement_id]: action.data.data
                }
            }
        default:
            return state;
    }
}