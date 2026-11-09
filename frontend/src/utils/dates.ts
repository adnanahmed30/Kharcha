




const dateformatter = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });
const dayformatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });


function toMonthText(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const paddedMonth = String(month).padStart(2, "0");
    return `${year}-${paddedMonth}`;

}


export function todayText(): string {
    const date = new Date();
    const day = date.getDate();
    const paddedDay = String(day).padStart(2, "0");
    return `${toMonthText(date)}-${paddedDay}`;
}

export function formatDay(isoDate: string): string {
    const [year, month, day] = isoDate.split("-").map(Number);
    const monthIndex = month - 1;
    const date = new Date(year, monthIndex, day);
    return dayformatter.format(date);
}




export function currentMonth(): string {
    return toMonthText(new Date());
}


export function shiftMonth(month: string, delta: number): string {
    const [year, monthNumber] = month.split("-").map(Number);
    const monthIndex = monthNumber - 1 + delta;
    const date = new Date(year, monthIndex, 1);
    return toMonthText(date);
}

export function formatMonthLabel(month: string): string {
    const [year, monthNumber] = month.split("-").map(Number);
    const monthIndex = monthNumber - 1;
    const date = new Date(year, monthIndex, 1);

    return dateformatter.format(date);
}



