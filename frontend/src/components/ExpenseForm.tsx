import { useState } from "react";
import { CATEGORIES, CURRENCIES, type Category, type Currency, type ExpenseIn } from "../types";
import { todayText } from "../utils/dates";
import type { SubmitEvent } from "react";
import { toInputText, toMinorUnits } from "../utils/money";

interface ExpenseFormprops {
    onSave: (input: ExpenseIn) => Promise<void>;
    initial?: ExpenseIn;
}

function ExpenseForm({ onSave, initial }: ExpenseFormprops) {
    const [amountText, setAmountText] = useState(initial ? toInputText(initial.amount_minor) : "");
    const [currency, setCurrency] = useState<Currency>(initial?.currency ?? "INR");
    const [category, setCategory] = useState<Category>(initial?.category ?? "Food");
    const [spentOn, setSpentOn] = useState(initial?.spent_on ?? todayText());
    const [note, setNote] = useState(initial?.note ?? "");
    const [formError, setFormError] = useState<String | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const labelClass = "mb-1 block text-sm font-medium text-gray-700";
    const inputClass =
        "rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30";
    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        setFormError(null);
        e.preventDefault();
        const amount_minor = toMinorUnits(amountText);
        if (amount_minor === null) {
            setFormError("Enter an amount greater than 0");
            return;
        }
        const expense: ExpenseIn = {
            amount_minor: amount_minor,
            currency: currency,
            category: category,
            note: note.trim() || null,
            spent_on: spentOn
        }
        setIsSaving(true);
        try {
            await onSave(expense);
        } catch (err) {
            err instanceof Error ? setFormError(err.message) : "Something went wrong!";
        } finally {
            setIsSaving(false);
        }
    }



    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
            <div>
                <label htmlFor="expense-amount" className={labelClass}>Amount</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        inputMode="decimal"
                        id="expense-amount"
                        value={amountText}
                        onChange={(e) => setAmountText(e.target.value)}
                        className={`${inputClass} min-w-0 flex-1 tabular-nums`}
                    />
                    <select
                        aria-label="Currency"
                        id="expense-currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as Currency)}
                        className={`${inputClass} w-24`}
                    >
                        {CURRENCIES.map((code) => (
                            <option key={code} value={code}>{code}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div>

                    <label htmlFor="expense-category" className={labelClass}>Category</label>
                    <select
                        id="expense-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                        className={inputClass}
                    >
                        {CATEGORIES.map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="expense-date" className={labelClass}>Date</label>
                    <input
                        id="expense-date"
                        type="date"
                        value={spentOn}
                        onChange={(e) => setSpentOn(e.target.value)}
                        max={todayText()}
                        className={inputClass}
                    />
                </div>
            </div>
            <div>
                <label htmlFor="expense-note" className={labelClass}>Note
                    <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                    id="expense-note"
                    type="text"
                    maxLength={200}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={inputClass}
                />
            </div>
            {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}</p>
            }
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-lg bg-emerald-600 px-5 py-2 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disbaled:opacity-60"
                >
                    {isSaving ? "Saving.." : "Save"}
                </button>
            </div>
        </form>
    );
}


export default ExpenseForm;