import { Link } from "react-router";
import type { ExpenseOut } from "../types";
import { formatDay } from "../utils/dates";
import { formatAmount, formatPaise } from "../utils/money";


interface ExpenseRowProps {
    expense: ExpenseOut;
    onDelete: (id: number) => void;
}

const actionClass =
    "rounded-md px-2 py-1 text-sm text-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink";


function ExpenseRow({ expense, onDelete }: ExpenseRowProps) {
    return (
        <li className="flex items-start gap-3 px-5 py-4 sm:items-center sm:gap-4">
            <span className="w-12 shrink-0 pt-1 text-xs font-medium uppercase tracking-wider text-muted sm:pt-0">
                {formatDay(expense.spent_on)}</span>
            <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{expense.category}</p>
                {expense.note && <p className="truncate text-sm text-muted">{expense.note}</p>}
            </div>
            {/* On phones the actions sit under the amount; from sm up they sit beside it. */}
            <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
                <div className="text-right tabular-nums">
                    {expense.currency === "INR" ? (
                        <p className="font-medium">{formatPaise(expense.amount_inr_paise)}</p>
                    ) : (
                        <>
                            <p className="font-medium">{formatAmount(expense.amount_minor, expense.currency)}</p>
                            <p className="text-xs text-muted">{formatPaise(expense.amount_inr_paise)}</p>
                        </>
                    )}
                </div>
                <div className="-mr-2 flex gap-1">
                    <Link
                        to={`/edit/${expense.id}`}
                        className={`${actionClass} hover:bg-canvas-alt hover:text-ink`}>
                        Edit
                    </Link>
                    <button
                        type="button"
                        onClick={() => onDelete(expense.id)}
                        className={`${actionClass} hover:bg-red-50 hover:text-red-600`}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </li>
    );
}



export default ExpenseRow;
