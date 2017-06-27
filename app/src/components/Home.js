import React, { Component } from 'react'
import { graphql, gql } from 'react-apollo'
import { Redirect, withRouter } from 'react-router-dom'

import Chat from './Chat'

const query = gql`
  query($token: String!) {
    query(token: $token) {
      __typename
      error
      user {
        __typename
        _id
        email
        name
        created
      }
    }
  }
`

@graphql(query, {
  options: ({ ownProps }) => {
    return ({ variables: { token: localStorage.getItem('token') } })
  },
  skip: (ownProps) => {
    return !localStorage.getItem('token')
  },
})
@withRouter
export default class Home extends Component {
  state = {}
  render() {
    if (!localStorage.getItem('token'))
      return (<Redirect to="/login" />)

    if (this.props.data.loading)
      return (<p>LOADING..</p>)

    return (
      <div>
        <p>You are logged as {this.props.data.query.user.name} [{this.props.data.query.user.email}]</p>
        <Chat user={this.props.data.query.user} channel={this.props.match.params && this.props.match.params.channel}/>
      </div>
    )
  }
}
