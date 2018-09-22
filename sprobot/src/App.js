import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import DiscordButton from './components/DiscordButton.js';



class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">ChrisLBC Bot Management</h1>
        </header>
        <div className="Sprobot">
          <DiscordButton />
        </div>
      </div>
    );
  }
}

export default App;
