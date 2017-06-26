import * as assert from 'assert'
import to from 'await-to-ts'
import * as faker from 'faker'
import * as mongoose from 'mongoose'
import {
  IUser,
  User,
} from '../server/resolvers/mongoose'

export interface ISeederConfiguration {
  reviews: number
}

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
/* istanbul ignore next */
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    // tslint:disable-next-line:no-bitwise
    targetLength = targetLength >> 0
    padString = String(padString || ' ')
    if (this.length > targetLength) {
      return String(this)
    } else {
      targetLength = targetLength - this.length
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length)
      }
      return padString.slice(0, targetLength) + String(this)
    }
  }
}

function* generateID() {
  let i = 0
  while (1) {
    yield (i++).toString().padStart(24, '0')
  }
}

export class Seeder {
  public static async seed(configuration: ISeederConfiguration, progress: () => void = () => void 0) {
    const { reviews } = configuration
    const userIds = generateID()
    const superadmin = new User({
      _id: mongoose.Types.ObjectId(userIds.next().value),
      email: 'phra',
      name: faker.name.findName(),
      role: 'admin',
    }) as IUser

    await superadmin.setPassword('TEST')
    const [_] = await to(superadmin.save())
    assert.ifError(_)
    progress()

    const user1 = new User({
      _id: mongoose.Types.ObjectId(userIds.next().value),
      email: 'USER1',
      name: faker.name.findName(),
      role: 'user',
    }) as IUser

    await user1.setPassword('TEST')
    const [e] = await to(user1.save())
    assert.ifError(e)
  }
}
