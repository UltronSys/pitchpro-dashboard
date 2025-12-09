import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PitchProDashboard from './pages/PitchProDashboard';
import PitchProDashboardSimple from './pages/PitchProDashboardSimple';
import TestFirebase from './pages/TestFirebase';
import CalendarPage from './pages/CalendarPage';
import Analytics from './pages/Analytics';
import Sessions from './pages/Sessions';
import Groups from './pages/Groups';
import Finances from './pages/Finances';
import SessionDetails from './pages/SessionDetails';
import { OrganizationProvider } from './contexts/OrganizationContext';

function App() {
  return (
    <Router>
      <OrganizationProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/test-firebase" element={<TestFirebase />} />
          <Route path="/pitchpro" element={<PitchProDashboardSimple />} />
          <Route path="/pitchpro-firebase" element={<PitchProDashboard />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="sessions/:sessionId" element={<SessionDetails />} />
            <Route path="session-details/:sessionId" element={<SessionDetails />} />
            <Route path="groups" element={<Groups />} />
            <Route path="finances" element={<Finances />} />
          </Route>
        </Routes>
      </OrganizationProvider>
    </Router>
  );
}

export default App;