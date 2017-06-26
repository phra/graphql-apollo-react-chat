const query = `
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      error
      token
      user {
        active
        created
        email
      }
    }
  }
`

export const LOGIN = {
  query,
  variables: null,
}
