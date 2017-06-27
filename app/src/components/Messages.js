import React, { Component } from 'react'
import { graphql, gql } from 'react-apollo'

const messages = gql`
  query messages($channel: String!) {
    messages(channel: $channel) {
      __typename
      messages {
        __typename
        _id
        created
        sender
        channel
        text
      }
    }
  }
`

const messages$ = gql`
    subscription($channel: String!){
      onMessage(channel: $channel){
        _id
        created
        sender
        channel
        text
      }
    }
`

@graphql(messages, {
  options: (props) => ({
    variables: {
      channel: props.channel,
    },
  }),
  props: (_props) => ({
    ..._props,
    subscribeToNewMessages: params => {
      return _props.data.subscribeToMore({
        document: messages$,
        variables: {
          channel: params.channel,
        },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) {
            return prev;
          }

          const message = subscriptionData.data.onMessage
          const ret = Object.assign({}, prev, {
            messages: {
              ...prev.messages,
              messages: [...prev.messages.messages, message]
            }
          })

          return ret
        }
      })
    },
  })
})
export default class Messages extends Component {
  state = {}

  componentWillMount() {
    this.props.subscribeToNewMessages({
      channel: this.props.channel,
    })
  }

  render() {
    if (this.props.data.loading)
      return (<p>Loading..</p>)

    return (
      <div>
        <h3>Messages</h3>
        <ul>
          {this.props.data.messages.messages.map(m => (
            <li key={m.created}>
              <code>{m.sender}: {m.text}</code>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}
