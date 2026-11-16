
export function timeAgo(dateString: string): string {
    const seconds = Math.max(
        0,
        Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
    )

    const plural = (n: number, unit: string) =>
        `${n} ${unit}${n === 1 ? '' : 's'} ago`

    if (seconds < 60) return 'now'

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return plural(minutes, 'minute')
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return plural(hours, 'hour')

    const days = Math.floor(hours / 24)
    if (days === 1) return 'yesterday'
    if (days < 7) return plural(days, 'day')

    const weeks = Math.floor(days / 7)
    if (weeks === 1) return 'last week'
    if (weeks === 4) return 'last month'
    if (weeks < 4) return plural(weeks, 'week')

    const months = Math.floor(days / 30)
    if (months === 1) return 'last month'
    if (months < 12) return plural(months, 'month')

    const years = Math.max(1, Math.floor(days / 365))
    return plural(years, 'year')
}