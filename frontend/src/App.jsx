import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import DutyChange from "./components/duty-roster/DutyChange";
import Login from "./components/duty-roster/Login";
import Schedule from "./components/duty-roster/Schedule";
import MRTChecker from "./components/mrt-checker/MRTChecker";
import GDayPlanner from "./components/vacation-planner/GDayPlanner";
import ETRGenerator from "./components/etr-generator/ETRGenerator";
import PatchNotes from './components/patch-notes/PatchNotes';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  const handleSuccessfulLogin = (userData) => {
    setUserDetails(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserDetails(null);
  };

  // Private route wrapper component
  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/" replace />;
  };

  return (
    <Router basename="/mdaeip">
      {/* Single Toaster instance for the entire app */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 2000,
            theme: {
              primary: '#4ade80',
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: '#ef4444',
            },
          },
        }}
      />
      
      <Routes>
        {/* Login route */}
        <Route path="/" element={
          isAuthenticated ? (
            <Navigate to="/mdaduty" replace />
          ) : (
            <Login onLoginSuccess={handleSuccessfulLogin} />
          )
        } />
        
        {/* Main duty roster app */}
        <Route path="/mdaduty" element={
          <PrivateRoute element={
            <Schedule 
              userDetails={userDetails} 
              onLogout={handleLogout}
            />
          } />
        } />
        
        {/* Duty change form */}
        <Route path="/mdaduty/duty-change" element={
          <PrivateRoute element={
            <DutyChange 
              userDetails={userDetails}
              onLogout={handleLogout}
            />
          } />
        } />
        
        {/* MRT Checker app */}
        <Route path="/mrt-checker" element={
          <PrivateRoute element={
            <MRTChecker 
              userDetails={userDetails}
              onLogout={handleLogout}
            />
          } />
        } />

        {/* Vacation Planner app */}
        <Route path="/vacation-planner" element={
          <PrivateRoute element={
            <GDayPlanner 
              userDetails={userDetails}
              onLogout={handleLogout}
            />
          } />
        } />

        {/* ETR Generator app */}
        <Route path="/etr-generator" element={
          <PrivateRoute element={
            <ETRGenerator 
              userDetails={userDetails}
              onLogout={handleLogout}
            />
          } />
        } />

        {/* Patch Notes */}
        <Route path="/patch-notes" element={
          <PrivateRoute element={
            <PatchNotes 
              userDetails={userDetails}
              onLogout={handleLogout}
            />
          } />
        } />

        {/* Fallback redirect - any unknown route goes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;