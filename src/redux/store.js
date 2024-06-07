import { createStore, combineReducers } from 'redux';
import login from './reducers/login';

const appReducers = combineReducers({
    login: login,
});

export default createStore(appReducers);