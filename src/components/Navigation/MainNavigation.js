import React from 'react';
import { NavLink } from 'react-router-dom';

import './MainNavigation.css'

const mainNavigation = props => (
    <header className="main-navigation">
        <div className="main-navigation__logo">
            <NavLink to="/">
                <h1>Red Hat Open Source Contest</h1>
            </NavLink>
        </div>
        <nav className="main-navigation__items">
            <ul>
                <li>
                    <NavLink to="/auth">Authenticate</NavLink>
                </li>
                <li>
                    <NavLink to="/tasks">Tasks</NavLink>
                </li>
            </ul>
        </nav>
    </header>
);

export default mainNavigation;