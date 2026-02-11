import React from 'react';
import { NavLink } from 'react-router-dom';

const NavBar = () => {
    return (
        <nav className="nav-bar">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">🏠</span>
                <span>Home</span>
            </NavLink>
            <NavLink to="/collection" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">♻️</span>
                <span>Collection</span>
            </NavLink>
            <NavLink to="/marketplace" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">🛒</span>
                <span>Market</span>
            </NavLink>
            <NavLink to="/wallet" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">💰</span>
                <span>Wallet</span>
            </NavLink>
        </nav>
    );
};

export default NavBar;
