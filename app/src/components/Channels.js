import React, { Component } from 'react';
import { graphql, gql } from 'react-apollo'
import { Link } from 'react-router-dom'

const channels = gql`
  query {
    channels {
      error
      channels
    }
  }
`
@graphql(channels, {
  options: (props) => ({}),
})
export default class Channels extends Component {
  state = {}

  render() {
    if (this.props.data.loading)
      return (<p>Loading..</p>)

    return (
      <div>
        <h5>Channels</h5>
        <ul>
          {this.props.data.channels.channels.map(c => (
            <li key={c}>
              <Link to={`/${c}`}>
                {c}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}
