import React from 'react';
import { ApolloClient, ApolloProvider, createNetworkInterface } from 'react-apollo';
import ReactDOM from 'react-dom';
import { addGraphQLSubscriptions, SubscriptionClient } from 'subscriptions-transport-ws';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

const wsClient = new SubscriptionClient(`ws://localhost:5000/graphql`, {
  reconnect: true
})

const networkInterface = createNetworkInterface({
  uri: 'http://localhost:4000/graphql'
})

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
)

const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>, document.getElementById('root')
)

registerServiceWorker()
