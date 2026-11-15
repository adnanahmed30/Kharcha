import { useState, type ReactNode, type SubmitEvent } from "react";
import { NAME_MAX_LENGTH, type RegisterIn } from "../types";


interface AuthFormProps {
    submitLabel: string;
    // Sign-up asks for a name; login doesn't (name is then "").
    showNameField?: boolean;
    // "new-password" on sign-up lets password managers suggest a strong password.
    passwordAutoComplete: "current-password" | "new-password";
    passwordHint?: string;
    minPasswordLength: number;
    onSubmit: (values: RegisterIn) => Promise<void>;
    footer: ReactNode;
}


function EyeIcon({ crossedOut }: { crossedOut: boolean }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.75 10S4.75 4.25 10 4.25 18.25 10 18.25 10 15.25 15.75 10 15.75 1.75 10 1.75 10Z" />
            <circle cx="10" cy="10" r="2.5" />
            {crossedOut && <path d="M3 3l14 14" />}
        </svg>
    );
}


// Same look as ExpenseForm: borderless card, uppercase labels, black pill button.
function AuthForm({ submitLabel, showNameField = false, passwordAutoComplete, passwordHint, minPasswordLength, onSubmit, footer }: AuthFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const labelClass = "mb-2 block text-xs font-medium uppercase tracking-wider text-muted";
    // No right padding here on purpose: the password field needs extra room for the eye button,
    // and two padding-right classes on one element would fight each other.
    const inputClass =
        "h-12 w-full rounded-xl border border-transparent bg-canvas-alt pl-3.5 text-ink transition-colors focus:border-ink focus:bg-surface focus:outline-none";

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setFormError(null);
        if (showNameField && !name.trim()) {
            setFormError("Name cannot be empty.");
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit({ name: name.trim(), email: email.trim(), password });
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Something went wrong!");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-surface p-6 sm:p-8">
            {showNameField && (
                <div>
                    <label htmlFor="auth-name" className={labelClass}>Name</label>
                    <input
                        id="auth-name"
                        type="text"
                        autoComplete="name"
                        required
                        maxLength={NAME_MAX_LENGTH}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`${inputClass} pr-3.5`}
                    />
                </div>
            )}
            <div>
                <label htmlFor="auth-email" className={labelClass}>Email</label>
                <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputClass} pr-3.5`}
                />
            </div>
            <div>
                <label htmlFor="auth-password" className={labelClass}>Password</label>
                <div className="relative">
                    <input
                        id="auth-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={passwordAutoComplete}
                        required
                        minLength={minPasswordLength}
                        maxLength={128}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-describedby={passwordHint ? "auth-password-hint" : undefined}
                        // pr-12 keeps typed text clear of the 48px-wide eye button, however long it gets.
                        className={`${inputClass} pr-12`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((shown) => !shown)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-controls="auth-password"
                        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
                    >
                        <EyeIcon crossedOut={showPassword} />
                    </button>
                </div>
                {passwordHint && <p id="auth-password-hint" className="mt-2 text-sm text-muted">{passwordHint}</p>}
            </div>
            {formError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}</p>
            }
            <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted">{footer}</p>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex shrink-0 items-center gap-3 rounded-full bg-ink py-1 pl-5 pr-1 font-medium text-white transition-colors hover:bg-ink/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-ink"
                >
                    {isSubmitting ? "Please wait.." : submitLabel}
                    <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-white text-ink">
                        <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 8h10M9 4l4 4-4 4" />
                        </svg>
                    </span>
                </button>
            </div>
        </form>
    );
}


export default AuthForm;
