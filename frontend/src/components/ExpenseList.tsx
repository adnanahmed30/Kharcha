import type { ExpenseOut } from "../types";
import ExpenseRow from "./ExpenseRow";


interface ExpenseListProps {
    expenses: ExpenseOut[];
    onDelete: (id: number) => void;
}


function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
    if (expenses.length === 0) {
        return <p className="rounded-2xl bg-surface p-8 text-center text-sm text-muted">
            No expenses this month</p>;
    }

    return (
        <ul className="divide-y divide-line rounded-2xl bg-surface">
            {expenses.map((expense) => (
                <ExpenseRow key={expense.id} expense={expense} onDelete={onDelete}/>
            ))}
        </ul>
    );
}


export default ExpenseList;