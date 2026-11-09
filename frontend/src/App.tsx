import { BrowserRouter, Link, Route, Routes } from "react-router";

import AddExpensePage from "./pages/AddExpensePage";
import DashboardPage from "./pages/DashboardPage";
import EditExpensePage from "./pages/EditExpensePage";


function App() {
  return (<BrowserRouter>
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <Link to="/" className="text-2xl font-bold text-emerald-600">Kharcha</Link>
        <Link to="/add" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          Add expense</Link>
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