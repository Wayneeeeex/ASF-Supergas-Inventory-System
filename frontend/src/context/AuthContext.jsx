import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const TOKEN_KEY = "asf_token";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [checking, setChecking] = useState(true); // true while verifying a stored token on load

    useEffect(() => {
        let cancelled = false;

        async function verify() {
            if (!token) {
                setChecking(false);
                return;
            }
            try {
                const res = await fetch(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Session expired");
                const data = await res.json();
                if (!cancelled) setUser(data.user);
            } catch {
                if (!cancelled) {
                    localStorage.removeItem(TOKEN_KEY);
                    setToken(null);
                    setUser(null);
                }
            } finally {
                if (!cancelled) setChecking(false);
            }
        }

        verify();
        return () => { cancelled = true; };
    }, [token]);

    async function login(email, password) {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");

        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
    }

    function logout() {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
    }

    function updateProfile(updatedUser, updatedToken) {
        if (updatedToken) {
            localStorage.setItem(TOKEN_KEY, updatedToken);
            setToken(updatedToken);
        }
        if (updatedUser) {
            setUser(updatedUser);
        }
    }

    return (
        <AuthContext.Provider value={{ user, token, checking, login, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}