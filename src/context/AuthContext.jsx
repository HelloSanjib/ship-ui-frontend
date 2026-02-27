import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../lib/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in securely via cookie
        const checkUserLoggedIn = async () => {
            try {
                const { data } = await api.get('/auth/me');
                setUser(data);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUserLoggedIn();
    }, []);

    const loginWithGoogle = async (credentialResponse) => {
        try {
            const { data } = await api.post('/auth/google', {
                token: credentialResponse.credential,
            });

            setUser(data);

            // Bonus: Sync guest history
            await syncGuestHistory(data);

        } catch (error) {
            console.error('Google Login Error', error);
            toast.error('Failed to log in with Google');
        }
    };

    const syncGuestHistory = async (userData) => {
        try {
            const storedHistory = localStorage.getItem('guest_history');
            if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory);

                if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
                    const { data } = await api.post('/history/sync', {
                        guestHistories: parsedHistory,
                    });

                    toast.success(`Welcome ${userData.name}! ${data.count} saved guest generations synced.`);
                } else {
                    toast.success(`Welcome ${userData.name}!`);
                }

                // Clear local storage after syncing
                localStorage.removeItem('guest_history');
            } else {
                toast.success(`Welcome ${userData.name}!`);
            }
        } catch (error) {
            console.error("Error syncing history", error);
            toast.error("Logged in, but failed to sync existing guest history");
        }
    }

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error', error);
            toast.error('Failed to log out');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    return useContext(AuthContext);
};
