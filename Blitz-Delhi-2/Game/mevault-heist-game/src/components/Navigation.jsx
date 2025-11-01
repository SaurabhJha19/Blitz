import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/create-vault">Create Vault</Link>
                </li>
                <li>
                    <Link to="/vault-list">Vault List</Link>
                </li>
                <li>
                    <Link to="/attack-vault">Attack Vault</Link>
                </li>
                <li>
                    <Link to="/leaderboard">Leaderboard</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navigation;