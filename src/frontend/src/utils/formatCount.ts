// Shorten large counts, e.g. 1,000,000 becomes 1M
export function formatCount(count: number) {
    return new Intl.NumberFormat('en', { notation: 'compact' }).format(count)
}