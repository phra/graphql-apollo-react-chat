import * as assert from 'assert'
import { GraphQLOptions } from 'graphql-server-core'
import merge = require('lodash.merge')
import * as mongoose from 'mongoose'
import { MessageResolvers } from './Message'
import { UserResolvers } from './User'

function buildMongoUrl(user: string, password: string, host: string, port: number, db: string, authSource: string = db): string {
  const url = `mongodb://${user}:${password}@${host}:${port}/${db}?authSource=${authSource}`
  return url
}

const URL = buildMongoUrl(
  process.env.MONGO_USER as string,
  process.env.MONGO_PASSWORD as string,
  process.env.MONGO_HOST as string,
  parseInt(process.env.MONGO_PORT as string, 10),
  process.env.MONGO_DB as string,
);

(mongoose as any).Promise = global.Promise
/* istanbul ignore next */
mongoose.connect(URL).catch((err) => {
  // tslint:disable-next-line:no-console
  console.error(err)
  process.exit(-1)
})
const models = mongoose.connection
models.on('error', console.error.bind(console, 'connection error:'))
// tslint:disable-next-line:no-console
models.once('open', () => { console.log('* MongoDB connected *') })

export interface IResolver {
  [index: string]: () => Promise<any>
}

export interface IResolvers {
  [index: string]: IResolver
}

export const Models = models
export default merge({}, UserResolvers, MessageResolvers)
export * from './User'
