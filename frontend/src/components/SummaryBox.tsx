import type { SummaryOut } from "../types";
import { formatPaise } from "../utils/money";

interface SummaryBoxProps {
    summary: SummaryOut;
}




function SummaryBox({ summary }: SummaryBoxProps) {
    return (
        <section className="rounded-2xl bg-surface p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
                Total spent</p>
            <p className="mt-2 text-[clamp(1.75rem,8vw,3rem)] font-medium leading-tight tracking-tight tabular-nums [overflow-wrap:anywhere]">
                {formatPaise(summary.total_inr_paise)}</p>
            <p className="mt-2 text-sm text-muted">
                {summary.count} {summary.count === 1 ? "expense" : "expenses"}</p>
            {summary.by_category.length > 0 && (
                <ul className="mt-6 space-y-4 border-t border-line pt-6">
                    {summary.by_category.map((item) => {
                        const share = (item.total_inr_paise / summary.total_inr_paise) * 100;
                        return (<li key={item.category}>
                            <div className="flex justify-between gap-4 text-sm">
                                <span className="font-medium">{item.category}</span>
                                <span className="tabular-nums">{formatPaise(item.total_inr_paise)}
                                    <span className="ml-1.5 text-muted">({item.count})</span>
                                </span>
                            </div>
                            <div className="mt-2 h-1.5 rounded-full bg-canvas-alt">
                                <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${share}%` }} />
                            </div>
                        </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}


export default SummaryBox;
