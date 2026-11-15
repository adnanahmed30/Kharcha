import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { login } from "../api/auth";
import { useAuth } from "../auth/authContext";
import AuthForm from "../components/AuthForm";
import type { RegisterIn } from "../types";


// Only follow "from" if it is a path inside this app (starts with a single "/").
function safeReturnPath(state: unknown): string {
    const from = (state as { from?: unknown } | null)?.from;
    return typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : "/";
}


function LoginPage() {
    const { user, signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const returnPath = safeReturnPath(location.state);

    if (user) {
        return <Navigate to={returnPath} replace />;
    }

    // AuthForm always passes a name field; login only needs email and password.
    async function handleLogin({ email, password }: RegisterIn) {
        signIn(await login({ email, password }));
        navigate(returnPath, { replace: true });
    }

    return (
        <main className="mx-auto max-w-md">
            <h1 className="mb-6 text-xl font-medium tracking-tight sm:text-2xl">Log in</h1>
            <AuthForm
                submitLabel="Log in"
                passwordAutoComplete="current-password"
                minPasswordLength={1}
                onSubmit={handleLogin}
                footer={<>New here? <Link to="/register" className="font-medium text-ink underline underline-offset-2">Create an account</Link></>}
            />
        </main>
    );
}


export default LoginPage;
