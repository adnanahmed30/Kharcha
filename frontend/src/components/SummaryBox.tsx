import type { SummaryOut } from "../types";
import { formatPaise } from "../utils/money";

interface SummaryBoxProps {
    summary: SummaryOut;
}




function SummaryBox({ summary }: SummaryBoxProps) {
    return (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
                Total spent</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">
                {formatPaise(summary.total_inr_paise)}</p>
            <p className="mt-1 text-sm text-gray-500">
                {summary.count} {summary.count === 1 ? "expense" : "expenses"}</p>
            <ul className="mt-6 space-y-4">
                {summary.by_category.map((item) => {
                    const share = (item.total_inr_paise / summary.total_inr_paise) * 100;
                    return (<li key={item.category}>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">{item.category}</span>
                            <span className="tabular-nums">{formatPaise(item.total_inr_paise)}
                                <span>({item.count})</span>
                            </span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-gray-100">
                            <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${share}%` }} />
                        </div>
                    </li>
                    );
                })}
            </ul>
        </section>
    );
}


export default SummaryBox;