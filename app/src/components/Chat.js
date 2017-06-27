import React, { Component } from 'react'

import Channels from './Channels'
import Messages from './Messages'
import SendMessage from './SendMessage'
// import People from './People'
//        <People />

export default class Chat extends Component {
  state = {}
  render() {
    return (
      <div>
        <h3>CHAT {this.props.channel}</h3>
        <Channels />
        {this.props.channel ?
          <div>
            <Messages channel={this.props.channel} />
            <SendMessage channel={this.props.channel} />
          </div>
          :
          <p>Select a room..</p>
        }
      </div>
    )
  }
}
