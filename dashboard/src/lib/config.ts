export const BASE_PATH = process.env.NODE_ENV === 'production' ? '/anomaly-grid' : ''
export const asset = (path: string) => `${BASE_PATH}${path}`
