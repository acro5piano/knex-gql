import crypto from 'crypto'

export const log = (a: any) => console.log(JSON.stringify(a, undefined, 2))

export function sha256(str: string) {
  return crypto.createHash('sha256').update(str).digest('base64')
}

export const omitIdDeep = (obj: any): any => {
  return Object.keys(obj).reduce((o, key) => {
    if (key === 'id') {
      return o
    }
    const value = obj[key]
    if (Array.isArray(value)) {
      return { ...o, [key]: value.map((v) => omitIdDeep(v)) }
    }
    if (value === undefined || value === null) {
      return o
    }
    if (typeof value === 'object') {
      return { ...o, [key]: omitIdDeep(value) }
    }
    return {
      ...o,
      [key]: value,
    }
  }, {} as any)
}
