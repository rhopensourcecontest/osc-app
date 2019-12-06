import React, { Component } from 'react';
import logo from '../logo.svg';

import './Home.css'

class HomePage extends Component {
    render() {
        return (
            <React.Fragment>
                <div className="home">
                    <header className="home-header">
                        <img src={logo} className="home-logo" alt="logo" />
                        <p>
                            This application is currently under development.
                        </p>
                        <a
                            className="home-link"
                            href="https://research.redhat.com/red-hat-open-source-contest/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Learn About Open Source Contest!
                        </a>
                    </header>
                </div>
            </React.Fragment>
        );
    }
}

export default HomePage;