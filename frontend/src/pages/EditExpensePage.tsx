import { useNavigate, useParams } from "react-router";
import { getExpense, updateExpense } from "../api/expenses";
import { useFetch } from "../hooks/useFetch";
import ExpenseForm from "../components/ExpenseForm";
import type { ExpenseIn } from "../types";

function EditExpensePage() {
    const {id} = useParams();
    const expenseId = Number(id);
    // "/edit/abc" gives NaN; skip the request and show the same message as a missing expense.
    const isValidId = Number.isInteger(expenseId) && expenseId > 0;
    const {data: expense, isLoading, error} = useFetch(
        () => isValidId ? getExpense(expenseId) : Promise.reject(new Error("Expense not found.")),
        [expenseId],
    );
    const navigate = useNavigate();
    if(isLoading){
        return <p>Loading expense...</p>;
    }
    if(error){
        return <p>{error}</p>;
    }
    if(!expense){
        return null;
    }

    const handleSave = async (updated: ExpenseIn): Promise<void>=>{
        const changes: Partial<ExpenseIn> = {};
        if(updated.amount_minor !== expense.amount_minor ){
            changes.amount_minor = updated.amount_minor;
        }
        if(updated.category !== expense.category){
            changes.category = updated.category;
        }
        if(updated.currency !== expense.currency){
            changes.currency = updated.currency;
        }
        if(updated.note !== expense.note){
            changes.note = updated.note;
        }
        if(updated.spent_on !== expense.spent_on){
            changes.spent_on = updated.spent_on;
        }
        if(Object.keys(changes).length > 0){
            await updateExpense(expense.id, changes);
        }
        // Go back to the expense's month whether or not anything changed.
        const month = updated.spent_on.slice(0, 7);
        navigate(`/?month=${month}`);

    }



  return(
    <main>
        <h1 className="mb-6 text-2xl font-medium tracking-tight sm:text-3xl">Edit expense</h1>
        <ExpenseForm initial={expense} onSave={handleSave}/>
    </main>
  );
}

export default EditExpensePage;