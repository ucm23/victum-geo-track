import React, { useEffect, useState } from 'react'
import { Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

import { AuthProvider, useAuth } from "../context/AuthContext";

const Index = ({ company_id }) => {
    const location = useLocation();
    const { pathname } = location;
  
    return (
        <div>
            <h1>home</h1>
        </div>
    );
};

export default Index;