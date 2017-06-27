import * as assert from 'assert'
import to from 'await-to-ts'
import { withFilter } from 'graphql-subscriptions'
import { model, Model, MongooseDocument, Schema, Types } from 'mongoose'
import { IMessagePlain, IUserPlain } from '../../../schema'
import Utils from '../../../utils'
import { IContext } from '../../context'
import { pubsub } from '../../pubsub'
import { IPersisted } from './Persisted'
import { UserClass } from './User'

// tslint:disable-next-line:no-empty-interface
export interface IMessageMongoose extends IMessagePlain { }

export type IMessage = IMessageMongoose & MessageClass & IPersisted

export const MessageSchema = new Schema({
  active: {
    default: () => true,
    type: Boolean,
  },
  created: {
    default: () => new Date().toISOString(),
    type: String,
  },
  sender: String,
  channel: String,
  text: String,
})

export class MessageClass { }

MessageSchema.index({ created: 1, type: -1 })
MessageSchema.index({ channel: 1, type: 1 })
MessageSchema.index({ sender: 1, type: 1 })
MessageSchema.loadClass(MessageClass)

export const Message = model('Message', MessageSchema)

export const MessageResolvers = {
  Mutation: {
    async sendMessage(obj: void, { token, text, channel }: { token: string, text: string, channel: string }, context: IContext) {
      const MessageModel = context.Mongoose.model('Message')
      const [err, user] = await to(UserClass.getUserFromToken(token, context))
      assert.ifError(err)
      const [err1, count] = await to(MessageModel.count({ channel }).exec())
      assert.ifError(err1)
      const [err2, message] = await to(new Message({ sender: user.email, channel, text }).save())
      assert.ifError(err2)
      if (!count) {
        context.PubSub.publish('onChannel', channel)
      }

      context.PubSub.publish('onMessage', message)
      return { error: '' }
    },
  },
  Query: {
    async channels(root: object, _: void, context: IContext) {
      const [err, channels] = await to(getChannels(context))
      assert.ifError(err)
      return { error: '', channels }
    },
    async messages(root: object, { channel }: { channel: string }, context: IContext) {
      const [err, messages] = await to(getMessages(channel, context))
      assert.ifError(err)
      return { error: '', messages }
    },
  },
  Subscription: {
    onMessage: {
      resolve: (payload: any, args: any, context: any, info: any) => {
        return payload
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator('onMessage'),
        (payload, args) => {
          return payload.channel === args.channel
        },
      ),
    },
    onChannel: {
      resolve: (payload: any, args: any, context: any, info: any) => {
        return payload
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator('onChannel'),
        (payload, args) => {
          return true
        },
      ),
    },
  },
}

async function getChannels(context: IContext): Promise<string[]> {
  const MessageModel = context.Mongoose.model('Message')
  return MessageModel.distinct('channel').lean().exec() as Promise<string[]>
}

async function getMessages(channel: string, context: IContext): Promise<IMessage[]> {
  const MessageModel = context.Mongoose.model('Message')
  return MessageModel.find({ channel }).sort('created').lean().exec() as Promise<IMessage[]>
}
