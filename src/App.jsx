import { Route, Routes } from "react-router-dom";
import Index from "./pages/Index"
import Truck from "./pages/truck/Truck"
import CreateTruck from "./pages/truck/CreateTruck"

import User from "./pages/users/User"
import CreateUser from "./pages/users/CreateUser"

import Road from "./pages/route/Road"
import CreateRoad from "./pages/route/CreateRoad"

import './App.css'
import Calendars from "./pages/calendar/Calendars";


function App() {
    const company_id = 1;
    return (
        <Routes>
            <Route index element={<Index company_id={company_id} index={0} />} />
            <Route path="*" element={<Index company_id={company_id} index={0} />} />
            <Route path="/calendar" element={<Calendars company_id={company_id} index={1} />} />

            <Route path="/truck" element={<Truck company_id={company_id} index={2}/>} />
            <Route path="/truck/create" element={<CreateTruck company_id={company_id} />} />

            <Route path="/users" element={<User company_id={company_id} index={3}/>} />
            <Route path="/users/create" element={<CreateUser company_id={company_id} />} />

            <Route path="/routes" element={<Road company_id={company_id} index={4}/>} />
            <Route path="/routes/create" element={<CreateRoad company_id={company_id} />} />
        </Routes>
    )
}

export default App
