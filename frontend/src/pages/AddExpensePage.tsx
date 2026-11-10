import { useNavigate } from "react-router";
import ExpenseForm from "../components/ExpenseForm";
import { createExpense } from "../api/expenses";
import type { ExpenseIn } from "../types";

function AddExpensePage() {
    const navigate = useNavigate();
    async function handleSave(input: ExpenseIn) {
        const response = await createExpense(input);
        const month = response.spent_on.slice(0, 7);
        navigate(`/?month=${month}`);
    }
    return (
        <main>
            <h1 className="mb-6 text-2xl font-medium tracking-tight sm:text-3xl">Add expense</h1>
            <ExpenseForm onSave={handleSave} />
        </main>
    );
}

export default AddExpensePage;