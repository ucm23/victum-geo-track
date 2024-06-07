import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const authContext = createContext();

export const useAuth = () => {
    const context = useContext(authContext);
    if (!context) throw new Error("There is no Auth provider");
    return context;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    /*const signup = async (email, password) => {
        try {
            const response = await axios.post("/api/signup", { email, password });
            setUser(response.data.user);
        } catch (error) {
            console.error("Error signing up:", error);
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post("/api/login", { email, password });
            setUser(response.data.user);
        } catch (error) {
            console.error("Error logging in:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axios.post("/api/logout");
            setUser(null);
        } catch (error) {
            console.error("Error logging out:", error);
            throw error;
        }
    }; */

    useEffect(() => {
        const checkAuth = () => {
            try {
                //const response = await axios.get("/api/check-auth");
                setUser({
                    id: 1,
                    name: 'caoi'
                });
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(true);
            }
        };

        checkAuth();
    }, []);

    return (
        <authContext.Provider
            value={{
                //signup,
                //login,
                user,
                //logout,
                loading,
            }}
        >
            {children}
        </authContext.Provider>
    );
}
