import { saveToLocalStorage } from '../localStorage';

const localStorageMiddleware = store => next => action => {
    const result = next(action);
    const state = store.getState();
    saveToLocalStorage('state', state);
    return result;
};

export default localStorageMiddleware;
