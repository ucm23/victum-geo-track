import React, { useState, useMemo, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import Context from './context/Context';
import store from './redux/store';
import Index from "./pages/Index"
import Login from "./pages/Login"
import Truck from "./pages/truck/Truck"
import Users from "./pages/users/Users"
import BuzonCFDi from "./pages/buzon/BuzonCFDi"
import './App.css'
import Calendars from "./pages/calendar/Calendars";
import CreateEvent from "./pages/calendar/CreateEvent";
import NavBar from './components/NavBar';
import Roads from './pages/route/Roads';
import Status from './pages/settings/status/Status';
import General from './pages/settings/general/General';
import Groups from './pages/settings/groups/Groups';
import CreateRoad from './pages/route/CreateRoad';

function App() {

    const initialTokenState = localStorage.getItem('userToken') === 'true';
    const [userToken, setUserToken] = useState(initialTokenState);

    const authContext = useMemo(() => {
        return {
            signIn: () => {
                setUserToken(true);
                localStorage.setItem('userToken', 'true');
            },
            signUp: () => {
                setUserToken(true);
                localStorage.setItem('userToken', 'true');
            },
            signOut: () => {
                setUserToken(false);
                localStorage.removeItem('userToken');
            },
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('userToken', userToken.toString());
    }, [userToken]);

    return (
        <Context.Provider value={authContext}>
            <Provider store={store}>
                {!userToken ?
                    <Routes>
                        <Route
                            path="*"
                            element={<Login />}
                        />
                    </Routes> :
                    <NavBar>
                        <Routes>
                            <Route
                                path="/home"
                                element={<Index />}
                            />
                            <Route
                                exact
                                index
                                path="*"
                                element={<Index />}
                            />
                            <Route
                                path="/buzon"
                                element={<BuzonCFDi />}
                            />
                            <Route
                                path="/calendar"
                                element={<Calendars />}
                            />
                            <Route
                                path="/calendar/details"
                                element={<CreateEvent />}
                            />
                            <Route
                                path="/truck"
                                element={<Truck />}
                            />
                            <Route
                                path="/users"
                                element={<Users />}
                            />
                            <Route
                                path="/routes"
                                element={<Roads />}
                            />
                            <Route
                                path="/routes/create"
                                element={<CreateRoad />}
                            />
                            <Route
                                path="/status"
                                element={<Status />}
                            />
                            <Route
                                path="/settings"
                                element={<General />}
                            />
                            <Route
                                path="/groups"
                                element={<Groups />}
                            />
                            
                        </Routes>
                    </NavBar>
                }
            </Provider>
        </Context.Provider>
    )
}

export default App
