import { createContext, useContext } from "react";
import type { UserOut } from "../types";


export interface AuthState {
    user: UserOut | null;
    // True until the first "who am I?" check with the backend finishes.
    isLoading: boolean;
    signIn: (user: UserOut) => void;
    signOut: () => Promise<void>;
}


export const AuthContext = createContext<AuthState | null>(null);


export function useAuth(): AuthState {
    const auth = useContext(AuthContext);
    if (auth === null) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }
    return auth;
}
