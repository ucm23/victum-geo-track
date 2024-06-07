const initialState = { login: {} }

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case "OPEN_": return state = { ...state, information_user: action.data };
        default: return state;
    }
}

export default reducer;