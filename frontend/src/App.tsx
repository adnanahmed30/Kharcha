import { BrowserRouter, Link, Route, Routes } from "react-router";

import AuthProvider from "./auth/AuthProvider";
import { useAuth } from "./auth/authContext";
import RequireAuth from "./components/RequireAuth";
import AddExpensePage from "./pages/AddExpensePage";
import DashboardPage from "./pages/DashboardPage";
import EditExpensePage from "./pages/EditExpensePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";


function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-5">
      <Link to="/" className="shrink-0 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Kharcha</Link>
      {user && (
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={signOut}
            className="shrink-0 rounded-md px-2 py-1 text-sm text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink">
            Log out
          </button>
          {/* Long names are cut off with "…"; the full name shows on hover. */}
          <span title={user.name} className="min-w-0 truncate text-sm font-medium text-ink">{user.name}</span>
          <Link
            to="/add"
            className="inline-flex shrink-0 items-center gap-3 rounded-full bg-ink py-1 pl-4 pr-1 text-sm font-medium text-white transition-colors hover:bg-ink/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
            Add expense
            <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-white text-ink">
              <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M8 3v10M3 8h10" />
              </svg>
            </span>
          </Link>
        </div>
      )}
    </header>
  );
}


function App() {
  return (<BrowserRouter>
    <AuthProvider>
      <div className="min-h-screen bg-canvas text-ink">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-6">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Everything below needs a logged-in user. */}
            <Route element={<RequireAuth />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/add" element={<AddExpensePage />} />
              <Route path="/edit/:id" element={<EditExpensePage />} />
            </Route>
            <Route path="*" element={<p>Page not found.</p>} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  </BrowserRouter>
  );
}


export default App;
