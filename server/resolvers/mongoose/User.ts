import * as assert from 'assert'
import to from 'await-to-ts'
import * as bcrypt from 'bcrypt'
import { model, Schema } from 'mongoose'
import { IUserPlain } from '../../../schema'
import Utils from '../../../utils'
import { IContext } from '../../context'
import { IPersisted } from './Persisted'

/* istanbul ignore next */
const SLEEP_TIME = parseInt(process.env.SLEEP_TIME || '1000', 10)
const SALT_WORK_FACTOR = 10

export type IUser = IUserPlain & UserClass & IPersisted

export interface ISignup {
  user: IUserPlain
}

export class UserClass {
  public static async getUserFromToken(token: string, context: IContext) {
    const [err, payload] = await to(Utils.decodeJWT(token))
    assert.ifError(err)
    const email = payload.email
    const UserModel = context.Mongoose.model('User')
    // tslint:disable-next-line:max-line-length
    const [err1, user] = await to(UserModel.findOne({ email: email.toLowerCase() }).exec()) as [Error, IUser]
    assert.ifError(err1)
    return user
  }

  public checkPassword(this: IUser, password: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      bcrypt.compare(password, this.password, (err, res) => {
        /* istanbul ignore next */
        if (err) { return reject(err) }
        if (!res) { return reject(new Error('Login failed.')) }
        resolve(true)
      })
    })
  }

  public setPassword(this: IUser, password: string | undefined): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!Utils.validatePassword(password)) {
        return reject(new Error('Password not valid.'))
      }
      bcrypt.hash(password, SALT_WORK_FACTOR, (err, hash) => {
        /* istanbul ignore next */
        if (err) { return reject(err) }
        this.password = hash
        resolve()
      })
    })
  }
}

export const UserSchema = new Schema({
  active: {
    default: () => true,
    type: Boolean,
  },
  created: {
    default: () => new Date().toISOString(),
    type: String,
  },
  email: {
    index: true,
    lowercase: true,
    type: String,
  },
  firstName: String,
  name: String,
  password: String,
})

UserSchema.index({ created: 1, type: -1 })

UserSchema.loadClass(UserClass)

export const User = model('User', UserSchema)

export const UserResolvers = {
  Mutation: {
    async signup(obj: void, { user }: ISignup, context: IContext) {
      await Utils.sleep(SLEEP_TIME)
      const UserModel = context.Mongoose.model('User')
      const { email, password } = user
      const [err1, existingUser] = await to(UserModel.findOne({ email: email.toLowerCase() }).exec())
      assert.ifError(err1)
      if (existingUser) {
        return { error: 'Email already exists.' }
      }
      const newUser = new User(user) as IUser
      const [err2] = await to(newUser.setPassword(password))
      if (err2) {
        return { error: 'Weak password.' }
      }
      const [err3] = await to(newUser.save())
      assert.ifError(err3)
      const [err4, token] = await to(Utils.signJWT({ email }))
      assert.ifError(err4)
      return { error: '', user: newUser, token }
    },
    async login(obj: void, { email, password }: { email: string, password: string }, context: IContext) {
      await Utils.sleep(SLEEP_TIME)
      const UserModel = context.Mongoose.model('User')
      const [err1, user] = await to(UserModel.findOne({ email: email.toLowerCase() }).exec()) as [Error, IUser]
      assert.ifError(err1)
      if (!user) {
        return { error: 'Wrong credentials.' }
      }
      const [err2, check] = await to(user.checkPassword(password))
      if (err2 || !check) {
        return { error: 'Wrong credentials.' }
      }
      const [err3, token] = await to(Utils.signJWT({ email }))
      assert.ifError(err3)
      return { error: '', user, token }
    },
  },
  Query: {
    async success() {
      return await Promise.resolve(42)
    },
    async query(obj: void, { token }: { token: string }, context: IContext) {
      const [err, user] = await to(UserClass.getUserFromToken(token, context))
      assert.ifError(err)
      return { error: '', user }
    },
  },
}
