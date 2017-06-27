import React, { Component } from 'react'
import { graphql, gql } from 'react-apollo'

const sendMessage = gql`
  mutation($token: String!, $channel: String!, $text: String!) {
    sendMessage(token: $token, channel: $channel, text: $text) {
      __typename
      error
    }
  }
`

@graphql(sendMessage, {
  options: (props) => ({}),
})
export default class Send extends Component {
  state = {}

  onSubmit(event) {
    const data = new FormData(event.target)
    this.props.mutate({
      variables: {
        channel: this.props.channel,
        text: data.get('message'),
        token: localStorage.getItem('token'),
      }
    })

    event.preventDefault()
  }

  render() {
    return (
      <section>
        <form onSubmit={this.onSubmit.bind(this)}>
          <label htmlFor="message">Insert message</label>
          <input type="text" name="message" />
          <label htmlFor="submit"></label>
          <input type="submit" name="submit" />
        </form>
      </section>
    )
  }
}
