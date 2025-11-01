import React from 'react';
import './styles/App.css';
import Navigation from './components/Navigation';
import CreateVault from './components/CreateVault';
import VaultList from './components/VaultList';
import AttackVault from './components/AttackVault';
import Leaderboard from './components/Leaderboard';

const App = () => {
    return (
        <div className="App">
            <Navigation />
            <main>
                <CreateVault />
                <VaultList />
                <AttackVault />
                <Leaderboard />
            </main>
        </div>
    );
};

export default App;