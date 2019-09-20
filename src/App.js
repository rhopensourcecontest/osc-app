import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          This application is currently under development.
        </p>
        <a
          className="App-link"
          href="https://research.redhat.com/red-hat-open-source-contest/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn About Open Source Contest!
        </a>
      </header>
    </div>
  );
}

export default App;
