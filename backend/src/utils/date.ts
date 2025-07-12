import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(dateInput: string | Date, style: 'absolute' | 'relative' = 'absolute'): string {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (style === 'relative') {
        return formatDistanceToNow(date, { addSuffix: true });
    }

    return format(date, 'd MMM yyyy, h:mm a');
}