import { createStore, combineReducers, applyMiddleware } from 'redux';
import login from './reducers/login';
import localStorageMiddleware from '../middleware/localStorageMiddleware';
import { loadFromLocalStorage } from '../localStorage';

const appReducers = combineReducers({
    login: login,
});

const persistedState = loadFromLocalStorage('state');

const store = createStore(
    appReducers,
    persistedState, 
    applyMiddleware(localStorageMiddleware)
);

export default store;
