// tslint:disable:max-line-length
export const SAMPLE_QUERY = `

mutation login {
  login(email: "SUPERADMIN", password: "TEST") {
    token
    user {
      email
      created
    }
  }
}

query query($token: String!) {
  query(token: $token) {
    error
    user {
      active
      created
      email
      _id
  	}
	}
}

mutation sendMessage($token: String!) {
  sendMessage(token: $token, text: "testo", channel: "channel.io")
}

subscription sub {
  onMessage {
    sender
    text
    channel
  }
}

`
