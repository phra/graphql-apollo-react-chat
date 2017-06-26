import * as assert from 'assert'
import * as dotenv from 'dotenv'
dotenv.config()
import to from 'await-to-ts'
import * as commander from 'commander'
import * as faker from 'faker'
import merge = require('lodash.merge')
import * as progress from 'progress'
import mongooseResolvers, { Models } from '../server/resolvers/mongoose'
import { ISeederConfiguration, Seeder } from './seed'

commander
  .usage('ts-node seed/cli.ts [options]')
  .option('-r, --reviews <r>', 'Number of reviews to generate', 10)
  .parse(process.argv)

const { reviews } = commander

Models.on('error', console.error.bind(console, 'connection error:'))
Models.once('open', async () => {
  const [_] = await to(Promise.all(Object.values(Models.collections).map((c) => c.drop())))
  const bar = new progress(`Seeding database [:bar] :rate/s :percent :etas`, {
    complete: '+',
    incomplete: '-',
    total: 1 + +reviews,
    width: 60,
  })

  const conf: ISeederConfiguration = {
    reviews,
  }

  const [err1] = await to(Seeder.seed(conf, () => bar.tick()))
  assert.ifError(err1)
  const [err2] = await to(Models.close())
  assert.ifError(err2)
})
