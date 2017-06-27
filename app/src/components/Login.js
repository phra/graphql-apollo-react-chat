import React, { Component } from 'react'
import { graphql, gql } from 'react-apollo'
import { withRouter } from 'react-router-dom'

const login = gql`
  mutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      __typename
      token
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

@graphql(login, {
  options: (props) => ({}),
})
@withRouter
class Login extends Component {
  state = {}

  onSubmit(event) {
    const data = new FormData(event.target)
    const _this = this
    this.props.mutate({
      variables: {
        email: data.get('email'),
        password: data.get('password'),
      }
    }).then(({ data }) => {
      localStorage.setItem('token', data.login.token)
      _this.props.history.push('/')
    }).catch(err => console.error(err))
    event.preventDefault()
  }

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit.bind(this)} >
          <h4>LOGIN COMPONENT</h4>
          <label htmlFor="email">Email</label>
          <input type="text" name="email"></input>
          <label htmlFor="password">Password</label>
          <input type="text" name="password"></input>
          <label htmlFor="submit"></label>
          <input type="submit" name="submit"></input>
        </form>
      </div>
    )
  }
}

export default Login
