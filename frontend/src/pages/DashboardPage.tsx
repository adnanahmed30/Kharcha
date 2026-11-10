import { useSearchParams } from "react-router";
import { currentMonth, formatMonthLabel, shiftMonth } from "../utils/dates";
import SummaryBox from "../components/SummaryBox";
import { deleteExpense, getSummary, listExpenses } from "../api/expenses";
import ExpenseList from "../components/ExpenseList";
import { useFetch } from "../hooks/useFetch";
import { isCategory, type Category } from "../types";
import CategoryChips from "../components/CategoryChips";
import { useState } from "react";


const monthButtonClass =
    "flex size-10 items-center justify-center rounded-full bg-surface text-ink transition-colors hover:bg-canvas-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface";

function Chevron({ direction }: { direction: "left" | "right" }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={direction === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} />
        </svg>
    );
}

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
                <button type="button" aria-label="Previous month" className={monthButtonClass}
                onClick={() => goToMonth(shiftMonth(month, -1))}>
                    <Chevron direction="left" />
                </button>
                <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">{formatMonthLabel(month)}</h1>
                <button
                type="button"
                aria-label="Next month"
                className={monthButtonClass}
                disabled={month === currentMonth()} onClick={() => goToMonth(shiftMonth(month, 1))}>
                    <Chevron direction="right" />
                </button>
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