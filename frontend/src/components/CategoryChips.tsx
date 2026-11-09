import { CATEGORIES, type Category } from "../types";


interface CategoryChipsProps {
    selected: Category | null;
    onSelect: (category: Category | null) => void;
}


function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
    const base = "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors";
    const active = "border-emerald-600 bg-emerald-600 text-white";
    const inactive = "border-gray-200 bg-white text-gray-700 hover:bg-gray-100";
    return (
        <div className="flex gap-2 overflow-x-auto pb-1">
            <button
                type="button"
                className={`${base} ${selected === null ? active : inactive}`}
                onClick={() => onSelect(null)}>
                All
            </button>
            {CATEGORIES.map((category) => (
                <button
                    type="button"
                    key={category}
                    className={`${base} ${selected === category ? active : inactive}`}
                    onClick={() => onSelect(category)}>
                    {category}
                </button>
            ))}
        </div>
    );
}

export default CategoryChips;