import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducers from './reducers';

const makeStore = createStore(reducers, applyMiddleware(thunk));

export default makeStore;