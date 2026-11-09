import { useSearchParams } from "react-router";
import { currentMonth, formatMonthLabel, shiftMonth } from "../utils/dates";
import SummaryBox from "../components/SummaryBox";
import { deleteExpense, getSummary, listExpenses } from "../api/expenses";
import ExpenseList from "../components/ExpenseList";
import { useFetch } from "../hooks/useFetch";
import { isCategory, type Category } from "../types";
import CategoryChips from "../components/CategoryChips";
import { useState } from "react";




function DashboardPage() {
    const [refreshCounter, setRefreshCounter] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const month = searchParams.get("month") ?? currentMonth();
    const rawCategory = searchParams.get("category");
    const category = isCategory(rawCategory) ? rawCategory : null;
    const { data: summary, isLoading, error } = useFetch(() => getSummary(month), [month, refreshCounter]);
    const { data: expenses, isLoading: isLoadingExpenses, error: expensesError } = useFetch(() => listExpenses({ month, category: category }), [month, category, refreshCounter]);

    function goToMonth(newMonth: string) {
        const params = new URLSearchParams(searchParams);
        params.set("month", newMonth);
        setSearchParams(params);
    }

    function handleSelectCategory(next: Category | null) {
        const params = new URLSearchParams(searchParams);
        if (next) {
            params.set("category", next);
        } else {
            params.delete("category");
        }
        setSearchParams(params);
    }

    async function handleDelete(expenseId: number) {
        const decision = window.confirm("Delete this expense?");
        if (!decision) return;
        try {
            await deleteExpense(expenseId);
            setRefreshCounter((count) => count + 1);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Something went wrong!";
            window.alert(message);
        }
    }


    return (
        <main className="space-y-6">
            <div className="flex items-center justify-between">
                <button type="button" aria-label="Previous month" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-600 hover:bg-gray-100" 
                onClick={() => goToMonth(shiftMonth(month, -1))}>&#9664;</button>
                <h1 className="text-xl font-semibold">{formatMonthLabel(month)}</h1>
                <button 
                type="button" 
                aria-label="Next month" 
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-white" 
                disabled={month === currentMonth()} onClick={() => goToMonth(shiftMonth(month, 1))}>&#9654;</button>
            </div>
            {isLoading && <p>Loading summary..</p>}
            {error && <p>Could not load summary: {error}</p>}
            {summary && <SummaryBox summary={summary} />}
            <CategoryChips selected={category} onSelect={handleSelectCategory} />
            {isLoadingExpenses && <p>Loading expenses..</p>}
            {expensesError && <p>Could not load expenses: {expensesError}</p>}
            {expenses && <ExpenseList expenses={expenses} onDelete={handleDelete}/>}
        </main>
    );
}

export default DashboardPage;