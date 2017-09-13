import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import { EventEmitter } from 'events'
import * as express from 'express'
import { execute } from 'graphql'
import { graphiqlExpress, graphqlExpress } from 'graphql-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import { subscribe } from 'graphql/subscription'
import { createServer } from 'http'
import * as morgan from 'morgan'
import OpticsAgent from 'optics-agent'
import { join } from 'path'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import Utils from '../utils'
import { IContext } from './context'
import { SAMPLE_QUERY } from './graphiql-query'
import { pubsub } from './pubsub'
import mongooseResolvers, { Models as Mongoose } from './resolvers/mongoose'

const schemaFile = Utils.readFile(join(__dirname, '..', 'schema', 'schema.gql'))
const MAX_GRAPHQL_BODY_LENGTH = 6e3
const OPTICS_API_KEY = process.env.OPTICS_API_KEY
const SCHEMA = makeExecutableSchema({
  resolvers: mongooseResolvers,
  typeDefs: [schemaFile],
})

OpticsAgent.instrumentSchema(SCHEMA as any)
const PORT = process.env.HTTP_PORT
const GRAPHQL_ENDPOINT = '/graphql'
const GRAPHIQL_ENDPOINT = '/graphiql'
const app = express()
const WS_PORT = 5000
const websocketServer = createServer((request, response) => {
  response.writeHead(404)
  response.end()
})

const subscriptionServer = SubscriptionServer.create(
  {
    schema: SCHEMA as any,
    execute,
    subscribe: subscribe as any,
  },
  {
    server: websocketServer,
    path: '/graphql',
  },
)

const helperMiddleware = [
  bodyParser.json(),
  bodyParser.text({ type: 'application/graphql' }),
  (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (req.body.query && req.body.query.length > MAX_GRAPHQL_BODY_LENGTH) {
      next(new Error('Query too large.'))
    }
    next()
  },
  (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    /* istanbul ignore next */
    if (req.is('application/graphql')) {
      req.body = { query: req.body }
    }
    next()
  },
  OpticsAgent.middleware(),
]

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    skip(req, res) { return res.statusCode < 400 },
  }))
}

app.use(cors())

app.use(GRAPHQL_ENDPOINT, ...helperMiddleware, graphqlExpress((req: express.Request) => {
  return {
    context: {
      Mongoose,
      PubSub: pubsub,
      opticsContext: OpticsAgent.context(req),
    },
    schema: SCHEMA,
  }
}))

app.use(GRAPHIQL_ENDPOINT, graphiqlExpress({
  endpointURL: GRAPHQL_ENDPOINT,
  query: SAMPLE_QUERY,
  variables: { token: '' },
  subscriptionsEndpoint: `ws://localhost:${WS_PORT}/graphql`,
}))

app.use('/', express.static(join(__dirname, '..', 'app')))
app.use('/docs', express.static(join(__dirname, '..', 'docs')))

// tslint:disable-next-line:no-console
websocketServer.listen(WS_PORT, () => console.log(
  `Websocket Server is now running on http://localhost:${WS_PORT}`,
))

export const App = app
export const Server = app.listen(PORT)
export const models = Mongoose
export const WebsocketServer = websocketServer
