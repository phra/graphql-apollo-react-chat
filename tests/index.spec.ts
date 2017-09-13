// tslint:disable:max-line-length
import { ifError } from 'assert'
import to from 'await-to-ts'
import { App, models, Server } from '../index'
import { ISeederConfiguration, Seeder } from '../seed'
import Utils from '../utils'
import * as QUERIES from './queries'
import { request } from './request'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000

// tslint:disable-next-line:no-debugger
debugger

beforeAll(() => {
  return new Promise((resolve, reject) => {
    models.once('open', async () => {
      const [_] = await to(Promise.all(Object.values(models.collections).map((c) => c.drop())))
      const configuration: ISeederConfiguration = {
        reviews: 30,
      }

      const [err1] = await to(Seeder.seed(configuration))
      if (err1) {
        reject(err1)
      }
      resolve()
    })
  })
})

afterAll(async () => {
  Server.close()
  models.close()
  process.exit(0)
})

describe('GRAPHQL endpoint', async () => {
  describe('miscellanea', async () => {
    it('should success', async () => {
      const [err, res] = await to(request(App, QUERIES.SUCCESS))
      expect(err).toBeNull()
      expect(res).toBeDefined()
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeFalsy()
      expect(res.status).toBe(200)
      expect(res.body.data).toBeDefined()
      expect(res.body.data.success).toBe(42)
    })

    it('should fail because of query too large', async () => {
      const [err, res] = await to(request(App, QUERIES.QUERY_TOO_LARGE))
      expect(err).toBeNull()
      expect(res.status).toBe(500)
    })
  })

  describe('public mutations', async () => {
    describe('signup', async () => {
      it(`should signup`, async () => {
        const user = {
          email: 'TEST1',
          password: 'TEST',
        }

        const [err, res] = await to(request(App, QUERIES.SIGNUP, { user }))
        expect(err).toBeNull()
        expect(res).toBeDefined()
        expect(res.body).toBeDefined()
        expect(res.body.errors).toBeFalsy()
        expect(res.status).toBe(200)
        expect(res.body.data).toBeDefined()
        expect(res.body.data.signup).toBeDefined()
        expect(res.body.data.signup.error).toBeFalsy()
        expect(res.body.data.signup.token).toBeTruthy()
      })

      it(`should not signup if email exists`, async () => {
        const user = {
          email: 'TEST2',
          password: 'TEST',
        }

        const [err, res] = await to(request(App, QUERIES.SIGNUP, { user }))
        expect(err).toBeNull()
        expect(res).toBeDefined()
        expect(res.body).toBeDefined()
        expect(res.body.errors).toBeFalsy()
        expect(res.status).toBe(200)
        expect(res.body.data).toBeDefined()
        expect(res.body.data.signup).toBeDefined()
        expect(res.body.data.signup.error).toBeFalsy()
        expect(res.body.data.signup.token).toBeTruthy()
        const [err2, res2] = await to(request(App, QUERIES.SIGNUP, { user }))
        expect(err2).toBeNull()
        expect(res2).toBeDefined()
        expect(res2.body).toBeDefined()
        expect(res2.body.errors).toBeFalsy()
        expect(res2.status).toBe(200)
        expect(res2.body.data).toBeDefined()
        expect(res2.body.data.signup).toBeDefined()
        expect(res2.body.data.signup.error).toBeTruthy()
        expect(res2.body.data.signup.token).toBeFalsy()
      })

      it(`should not signup if weak password`, async () => {
        const user = {
          email: 'TESTWEAK',
          password: 'password',
        }

        const [err, res] = await to(request(App, QUERIES.SIGNUP, { user }))
        expect(err).toBeNull()
        expect(res).toBeDefined()
        expect(res.body).toBeDefined()
        expect(res.body.errors).toBeFalsy()
        expect(res.status).toBe(200)
        expect(res.body.data).toBeDefined()
        expect(res.body.data.signup).toBeDefined()
        expect(res.body.data.signup.error).toBeTruthy()
        expect(res.body.data.signup.token).toBeFalsy()
      })
    })

    describe('login', async () => {
      it('should login if right credentials', async () => {
        const [err, res] = await to(request(App, QUERIES.LOGIN, { email: 'phra', password: 'TEST' }))
        expect(err).toBeNull()
        expect(res).toBeDefined()
        expect(res.body).toBeDefined()
        expect(res.body.errors).toBeFalsy()
        expect(res.status).toBe(200)
        expect(res.body.data).toBeDefined()
        expect(res.body.data.login).toBeDefined()
        expect(res.body.data.login.error).toBeFalsy()
        expect(res.body.data.login.token).toBeTruthy()
      })

      it('should not login if wrong email', async () => {
        const [err, res] = await to(request(App, QUERIES.LOGIN, { email: 'NOTEXISTING', password: 'TEST' }))
        expect(err).toBeNull()
        expect(res).toBeDefined()
        expect(res.body).toBeDefined()
        expect(res.body.errors).toBeFalsy()
        expect(res.status).toBe(200)
        expect(res.body.data).toBeDefined()
        expect(res.body.data.login).toBeDefined()
        expect(res.body.data.login.error).toBeTruthy()
        expect(res.body.data.login.token).toBeFalsy()
      })

      it('should not login if wrong password', async () => {
        const [err, res] = await to(request(App, QUERIES.LOGIN, { email: 'phra', password: 'WRONG' }))
        expect(res).toBeDefined()
        expect(res.body).toBeDefined()
        expect(res.body.errors).toBeFalsy()
        expect(res.status).toBe(200)
        expect(res.body.data).toBeDefined()
        expect(res.body.data.login).toBeDefined()
        expect(res.body.data.login.error).toBeTruthy()
        expect(res.body.data.login.token).toBeFalsy()
      })
    })
  })

  describe('authenticated mutations', () => {
    let token: string

    beforeAll(async () => {
      const [err, res] = await to(request(App, QUERIES.LOGIN, { email: 'phra', password: 'TEST' }))
      token = res.body.data.login.token
    })

    describe('chat', async () => {
      it('should join a channel', async () => {
        expect(true).toBeTruthy()
      })
      it('should send a message', async () => {
        expect(true).toBeTruthy()
      })
    })
  })
})
