import { useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser, logoutUser, restoreSession } from '../services/.';

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const init = async () => {
            setIsInitializing(true);
            const user = await restoreSession();
            setCurrentUser(user);
            setIsInitializing(false);
        };
        init();
    }, []);

    const login = async (user: User) => {
        const loggedUser = await loginUser(user.email, user.name, user.avatar, user.id);
        setCurrentUser(loggedUser);
        return loggedUser;
    };

    const logout = async () => {
        setIsLoggingOut(true);
        await logoutUser();
        setCurrentUser(null);
        setIsLoggingOut(false);
    };

    return {
        currentUser,
        setCurrentUser,
        isInitializing,
        isLoggingOut,
        login,
        logout
    };
};
