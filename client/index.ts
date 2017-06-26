import ApolloClient, {createNetworkInterface} from 'apollo-client'
import gql from 'graphql-tag'
import 'isomorphic-fetch'
import {addGraphQLSubscriptions, SubscriptionClient} from 'subscriptions-transport-ws'

// Create regular NetworkInterface by using apollo-client's API:
const networkInterface = createNetworkInterface({
 uri: 'http://localhost:3000',
})

// Create WebSocket client
const wsClient = new SubscriptionClient(`ws://localhost:5000/`, {
    reconnect: true,
    connectionParams: {
        // Pass any arguments you want for initialization
    },
})

// Extend the network interface with the WebSocket
const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
    networkInterface,
    wsClient,
)

// Finally, create your ApolloClient instance with the modified network interface
const apolloClient = new ApolloClient({
    networkInterface: networkInterfaceWithSubscriptions,
});

(apolloClient as any).subscribeToMore({
    document: gql`
        subscription onMessage {
            onMessage {
                sender
                text
                channel
            }
        }`,
    variables: {},
    updateQuery: (prev: any, {subscriptionData}: {subscriptionData: any}) => {
        // Modify your store and return new state with the new arrived data
    },
})
