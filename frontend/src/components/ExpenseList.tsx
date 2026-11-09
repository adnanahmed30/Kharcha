import type { ExpenseOut } from "../types";
import ExpenseRow from "./ExpenseRow";


interface ExpenseListProps {
    expenses: ExpenseOut[];
    onDelete: (id: number) => void;
}


function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
    if (expenses.length === 0) {
        return <p className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
            No expenses this month</p>;
    }

    return (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
            {expenses.map((expense) => (
                <ExpenseRow key={expense.id} expense={expense} onDelete={onDelete}/>
            ))}
        </ul>
    );
}


export default ExpenseList;