/**
 * Handles exporting data to CSV format
 */
export const exportToCSV = <T extends Record<string, any>>(
    data: T[],
    filename: string,
    columns?: { key: keyof T; header: string }[]
) => {
    if (!data || data.length === 0) return;

    // Determine headers
    const firstItem = data[0];
    if (!firstItem) return;

    const headers = columns
        ? columns.map(col => String(col.header))
        : Object.keys(firstItem).filter(key => typeof firstItem[key] !== 'object' || firstItem[key] === null);

    const keys = columns
        ? columns.map(col => col.key)
        : Object.keys(firstItem).filter(key => typeof firstItem[key] !== 'object' || firstItem[key] === null) as (keyof T)[];

    // Map data to rows
    const csvRows = [
        headers.join(','), // Header row
        ...data.map(item =>
            keys.map(key => {
                const val = item[key];
                const escaped = ('' + (val || '')).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',')
        )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
