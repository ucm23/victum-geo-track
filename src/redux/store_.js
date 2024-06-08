import { createStore, combineReducers } from 'redux';
import login from './reducers/login_';

const appReducers = combineReducers({
    login: login,
});

export default createStore(appReducers);