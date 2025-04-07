const rupiahFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    // maximumSignificantDigits: 5,
    minimumFractionDigits: 0
});

function useFormat(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function initializeDate(type: "first" | "last" | "current"): string {
    const now: Date = new Date();

    if (type === "last") {
        const lastDate: Date = new Date(now.getFullYear(), 11, 31);
        return useFormat(lastDate);
    }

    if (type === "first") {
        const firstDate: Date = new Date(now.getFullYear(), 0, 1);
        return useFormat(firstDate);
    }

    return useFormat(now); // Return the current date when type is "current"
}

export { rupiahFormatter, initializeDate }