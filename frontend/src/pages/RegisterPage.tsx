import { Link, Navigate, useNavigate } from "react-router";
import { register } from "../api/auth";
import { useAuth } from "../auth/authContext";
import AuthForm from "../components/AuthForm";
import type { RegisterIn } from "../types";


function RegisterPage() {
    const { user, signIn } = useAuth();
    const navigate = useNavigate();

    if (user) {
        return <Navigate to="/" replace />;
    }

    async function handleRegister(input: RegisterIn) {
        // The backend logs the new user in straight away (it sets the session cookie).
        signIn(await register(input));
        navigate("/", { replace: true });
    }

    return (
        <main className="mx-auto max-w-md">
            <h1 className="mb-6 text-xl font-medium tracking-tight sm:text-2xl">Create account</h1>
            <AuthForm
                submitLabel="Sign up"
                showNameField
                passwordAutoComplete="new-password"
                passwordHint="At least 8 characters."
                minPasswordLength={8}
                onSubmit={handleRegister}
                footer={<>Have an account? <Link to="/login" className="font-medium text-ink underline underline-offset-2">Log in</Link></>}
            />
        </main>
    );
}


export default RegisterPage;
