import { BrowserRouter, Link, Route, Routes } from "react-router";

import AddExpensePage from "./pages/AddExpensePage";
import DashboardPage from "./pages/DashboardPage";
import EditExpensePage from "./pages/EditExpensePage";


function App() {
  return (<BrowserRouter>
    <div className="min-h-screen bg-canvas text-ink">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Link to="/" className="text-xl font-semibold tracking-tight text-ink">Kharcha</Link>
        <Link
          to="/add"
          className="inline-flex items-center gap-3 rounded-full bg-ink py-1 pl-4 pr-1 text-sm font-medium text-white transition-colors hover:bg-ink/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          Add expense
          <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-white text-ink">
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 3v10M3 8h10" />
            </svg>
          </span>
        </Link>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/add" element={<AddExpensePage />} />
          <Route path="/edit/:id" element={<EditExpensePage />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </div>
    </div>
  </BrowserRouter>
  );
}


export default App;