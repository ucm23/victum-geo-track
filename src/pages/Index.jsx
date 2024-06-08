import React, { useEffect, useState } from 'react'
import { Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';
import { AuthProvider, useAuth } from "../context/AuthContext";

const Index = ({ }) => {
    const location = useLocation();
    const { pathname } = location;

    
    const information_user = useSelector(state => state.login.information_user);
    const { company_id } = information_user;
  
    return (
        <div>
            <h1>home</h1>
        </div>
    );
};

export default Index;