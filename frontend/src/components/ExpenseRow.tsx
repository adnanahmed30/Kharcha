import { Link } from "react-router";
import type { ExpenseOut } from "../types";
import { formatDay } from "../utils/dates";
import { formatAmount, formatPaise } from "../utils/money";


interface ExpenseRowProps {
    expense: ExpenseOut;
    onDelete: (id: number) => void;
}



function ExpenseRow({ expense, onDelete }: ExpenseRowProps) {
    return (
        <li className="flex items-center gap-4 px-4 py-3">
            <span className="w-14 shrink-0 text-sm text-gray-500">
                {formatDay(expense.spent_on)}</span>
            <div className="min-w-0 flex-1">
                <p className="font-medium">{expense.category}</p>
                {expense.note && <p className="truncate text-sm text-gray-500">{expense.note}</p>}
            </div>
            <div className="text-right tabular-nums">
                {expense.currency === "INR" ? (
                    <p className="font-medium">{formatPaise(expense.amount_inr_paise)}</p>
                ) : (
                    <>
                        <p className="font-medium">{formatAmount(expense.amount_minor, expense.currency)}</p>
                        <p className="text-xs text-gray-500">{formatPaise(expense.amount_inr_paise)}</p>
                    </>
                )}
            </div>
            <div className="flex shrink-0 gap-1">
                <Link
                    to={`/edit/${expense.id}`}
                    className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100">
                    Edit
                </Link>
                <button
                    type="button"
                    onClick={() => onDelete(expense.id)}
                    className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                >
                    Delete
                </button>
            </div>
        </li>
    );
}



export default ExpenseRow;