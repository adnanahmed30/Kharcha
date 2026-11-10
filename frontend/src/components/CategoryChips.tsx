import { CATEGORIES, type Category } from "../types";


interface CategoryChipsProps {
    selected: Category | null;
    onSelect: (category: Category | null) => void;
}


function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
    const base =
        "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
    const active = "border-ink bg-ink text-white";
    const inactive = "border-transparent bg-surface text-ink hover:border-ink/20";
    return (
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-sm:[mask-image:linear-gradient(to_right,black_85%,transparent)] max-sm:after:w-10 max-sm:after:shrink-0 max-sm:after:content-[''] sm:flex-wrap sm:overflow-visible">
            <button
                type="button"
                aria-pressed={selected === null}
                className={`${base} ${selected === null ? active : inactive}`}
                onClick={() => onSelect(null)}>
                All
            </button>
            {CATEGORIES.map((category) => (
                <button
                    type="button"
                    key={category}
                    aria-pressed={selected === category}
                    className={`${base} ${selected === category ? active : inactive}`}
                    onClick={() => onSelect(category)}>
                    {category}
                </button>
            ))}
        </div>
    );
}

export default CategoryChips;