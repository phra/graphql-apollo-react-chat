import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'

import logo from './logo.svg'
import './App.css'

import Home from './components/Home'
import Login from './components/Login'

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h2>Welcome to React</h2>
          </header>

          <Route path="/login" component={Login} />
          <Route path="/:channel" component={Home} />
          <Route exact path="/" component={Home} />
        </div>
      </Router>
    )
  }
}

export default App
