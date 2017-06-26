import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'

export type Partial<T> = {
  [P in keyof T]?: T[P]
}

export type Arraify<T> = {
  [P in keyof T]?: Array<T[P]>
}

export interface IQuery<T> {
  _eq?: T
  _ne?: T
  _in?: T[]
  _nin?: T[]
  _lt?: T
  _lte?: T
  _gt?: T
  _gte?: T
  _or?: Array<IQuery<T>>
  _and?: Array<IQuery<T>>
  _not?: IQuery<T>
  _nor?: Array<IQuery<T>>
  _exists?: boolean
  _type?: string
  _regex?: string
  _text?: string
}

export type Querify<T> = {
  [P in keyof T]?: IQuery<T[P]>
}

export interface IMongoQuery<T> {
  $eq?: T
  $ne?: T
  $in?: T[]
  $nin?: T[]
  $lt?: T
  $lte?: T
  $gt?: T
  $gte?: T
  $or?: Array<IMongoQuery<T>>
  $and?: Array<IMongoQuery<T>>
  $not?: IMongoQuery<T>
  $nor?: Array<IMongoQuery<T>>
  $exists?: boolean
  $type?: string
  $regex?: string
  $text?: string
}

export type MongoQuerify<T> = {
  [P in keyof T]?: IMongoQuery<T[P]>
}

export type Readonly<T> = {
  readonly [P in keyof T]: T[P];
}

export type Deferred<T> = {
  [P in keyof T]: Promise<T[P]>;
}

export type Proxify<T> = {
  [P in keyof T]: { get(): T[P]; set(v: T[P]): void }
}

export default class Utils {
  public static sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms))
  }

  public static signJWT(payload: object, expiresIn = '7d'): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, process.env.SECRET, { expiresIn }, (error, token) => {
        /* istanbul ignore next */
        if (error) {
          reject(error)
        }

        resolve(token)
      })
    })
  }

  public static decodeJWT(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.SECRET, (error: Error, payload: any) => {
        /* istanbul ignore next */
        if (error) {
          reject(error)
        }

        resolve(payload)
      })
    })
  }

  public static validatePassword(password: string | undefined) {
    return password !== 'password'
  }

  public static mapInputToQuery<T>(where: Querify<T> | Array<Querify<T>> = Object.create(null)): MongoQuerify<T> {
    const INITIAL_STATE: MongoQuerify<T> = Object.create(null)
    if (Array.isArray(where)) {
      return (where as any).map(Utils.mapInputToQuery)
    }

    Object.keys(where).forEach((k) => {
      switch (k) {
        case '_and':
        case '_or':
        case '_not':
        case '_nor':
          INITIAL_STATE[`$${k.slice(1)}`] = Utils.mapInputToQuery(where[k])
          break
        case '_eq':
        case '_ne':
        case '_in':
        case '_nin':
        case '_lt':
        case '_lte':
        case '_gt':
        case '_gte':
        case '_exists':
        case '_regex':
        case '_text':
          INITIAL_STATE[`$${k.slice(1)}`] = where[k]
          break
        default:
          INITIAL_STATE[k] = Utils.mapInputToQuery(where[k])
          break
      }
    })

    return INITIAL_STATE
  }

  public static getMostRecent(a: string, b: string) {
    return a > b ? a : b
  }

  public static readFile(path: string, encoding: string = 'utf8') {
    return readFileSync(path, encoding)
  }
}
