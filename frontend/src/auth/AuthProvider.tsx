import { useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, logout } from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";
import type { UserOut } from "../types";
import { AuthContext } from "./authContext";


function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserOut | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Any 401 from the backend means the session is gone (expired, logged out elsewhere).
        setUnauthorizedHandler(() => setUser(null));

        // The cookie is httpOnly, so the only way to know who is logged in is to ask the backend.
        let ignore = false;
        getCurrentUser()
            .then((current) => { if (!ignore) setUser(current); })
            .catch(() => { if (!ignore) setUser(null); })
            .finally(() => { if (!ignore) setIsLoading(false); });

        return () => {
            ignore = true;
            setUnauthorizedHandler(null);
        };
    }, []);

    async function signOut() {
        try {
            await logout();
        } finally {
            setUser(null);
        }
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn: setUser, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}


export default AuthProvider;
