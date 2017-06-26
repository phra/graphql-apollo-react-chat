const query = `
  mutation signup($user: Signup!) {
    signup(user: $user) {
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

export const SIGNUP = {
  query,
  variables: null,
}
