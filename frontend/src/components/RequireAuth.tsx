import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../auth/authContext";


// Wraps the pages that need a logged-in user (see App.tsx).
function RequireAuth() {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <p className="text-sm text-muted">Loading…</p>;
    }
    if (!user) {
        // Remember where the user was going so login can send them back there.
        return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
    }
    return <Outlet />;
}


export default RequireAuth;
