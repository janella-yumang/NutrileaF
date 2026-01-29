import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import AboutScreen from './screens/AboutScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import ForumScreen from './screens/ForumScreen';
import MoringaScreen from './screens/MoringaScreen';
import ScanScreen from './screens/ScanScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import MarketScreen from './screens/MarketScreen';
import ChatScreen from './screens/ChatScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import './App.css';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<HomeScreen />} />
                    <Route path="/about" element={<AboutScreen />} />
                    <Route path="/register" element={<RegisterScreen />} />
                    <Route path="/login" element={<LoginScreen />} />
                    <Route path="/profile" element={<ProfileScreen />} />
                    <Route path="/forum" element={<ForumScreen />} />
                    <Route path="/moringa" element={<MoringaScreen />} />
                    <Route path="/scan" element={<ScanScreen />} />
                    <Route path="/analysis/:id" element={<AnalysisScreen />} />
                    <Route path="/market" element={<MarketScreen />} />
                    <Route path="/chat" element={<ChatScreen />} />
                    <Route path="/analytics" element={<AnalyticsScreen />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;