import { PubSub } from 'graphql-subscriptions'
import { Connection } from 'mongoose'

export interface IContext {
  Mongoose: Connection
  PubSub: PubSub
}
