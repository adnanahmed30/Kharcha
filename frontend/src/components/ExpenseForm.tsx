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
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const labelClass = "mb-2 block text-xs font-medium uppercase tracking-wider text-muted";
    // No width here on purpose: each field adds w-full (or a fixed width) itself,
    // because two width classes on one element would fight each other.
    const inputClass =
        "h-12 rounded-xl border border-transparent bg-canvas-alt px-3.5 text-ink transition-colors focus:border-ink focus:bg-surface focus:outline-none";
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
            setFormError(err instanceof Error ? err.message : "Something went wrong!");
        } finally {
            setIsSaving(false);
        }
    }



    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl bg-surface p-6 sm:p-8"
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
                        className={`${inputClass} min-w-0 flex-1 text-lg font-medium tabular-nums`}
                    />
                    <select
                        aria-label="Currency"
                        id="expense-currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as Currency)}
                        className={`${inputClass} w-24 shrink-0`}
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
                        className={`${inputClass} w-full`}
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
                        className={`${inputClass} w-full`}
                    />
                </div>
            </div>
            <div>
                <label htmlFor="expense-note" className={labelClass}>Note{" "}
                    <span className="font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <input
                    id="expense-note"
                    type="text"
                    maxLength={200}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={`${inputClass} w-full`}
                />
            </div>
            {formError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}</p>
            }
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-3 rounded-full bg-ink py-1 pl-5 pr-1 font-medium text-white transition-colors hover:bg-ink/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-ink"
                >
                    {isSaving ? "Saving.." : "Save"}
                    <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-white text-ink">
                        <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 8h10M9 4l4 4-4 4" />
                        </svg>
                    </span>
                </button>
            </div>
        </form>
    );
}


export default ExpenseForm;