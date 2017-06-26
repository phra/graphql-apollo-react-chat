import { Application } from 'express'
import { agent, Response } from 'supertest'

interface IQuery {
  query: string
  variables: any
}

export function request(App: Application, query: IQuery, variables: any = null): Promise<Response> {
  query.variables = variables
  return new Promise((resolve, reject) => {
    agent(App)
      .post(`/graphql`)
      .set(`Content-Type`, `application/json`)
      .accept(`application/json`)
      .send(JSON.stringify(query))
      .end((err, res) => {
        /* istanbul ignore next */
        if (err) {
          return reject(err)
        }

        resolve(res)
      })
  }) as Promise<Response>
}
