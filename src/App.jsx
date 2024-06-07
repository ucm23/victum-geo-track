import React, { useState, useMemo, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import Context from './context/Context';
import store from './redux/store';
import Index from "./pages/Index"
import Login from "./pages/Login"
import Truck from "./pages/truck/Truck"
import CreateTruck from "./pages/truck/CreateTruck"

import Users from "./pages/users/Users"
import CreateUser from "./pages/users/CreateUser"
import CreateRoad from "./pages/route/CreateRoad"

import './App.css'
import Calendars from "./pages/calendar/Calendars";
import OrderWork from "./pages/calendar/OrderWork";
import CreateEvent from "./pages/calendar/CreateEvent";
import NavBar from './components/NavBar';
import Roads from './pages/route/Roads';

function App() {
    const company_id = 1;
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
        // Este efecto se ejecuta al montar el componente y cada vez que cambie userToken
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
                    <NavBar >
                        <Routes>
                            <Route
                                exact
                                index
                                path="/home"
                                element={<Index company_id={company_id} />}
                            />
                            <Route
                                path="/calendar"
                                element={<Calendars company_id={company_id} />}
                            />
                            <Route
                                path="/calendar/details"
                                element={<CreateEvent company_id={company_id} />}
                            />
                            <Route
                                path="/truck"
                                element={<Truck company_id={company_id} />}
                            />
                            <Route
                                path="/truck/create"
                                element={<CreateTruck company_id={company_id} />}
                            />

                            <Route
                                path="/users"
                                element={<Users company_id={company_id} />}
                            />
                            <Route
                                path="/users/create"
                                element={<CreateUser company_id={company_id} />}
                            />

                            <Route
                                path="/routes"
                                element={<Roads company_id={company_id} />}
                            />
                            <Route
                                path="/routes/create"
                                element={<CreateRoad company_id={company_id} />}
                            />
                        </Routes>
                    </NavBar>
                }
            </Provider>
        </Context.Provider>
    )
}

export default App
