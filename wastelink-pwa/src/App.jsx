import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Dashboard from './routes/Dashboard';
import Collection from './routes/Collection';
import Marketplace from './routes/Marketplace';
import Wallet from './routes/Wallet';

function App() {
    return (
        <div className="app-shell">
            <main>
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/collection" element={<Collection />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/wallet" element={<Wallet />} />
                </Routes>
            </main>
            <NavBar />
        </div>
    );
}

export default App;
