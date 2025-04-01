import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import SetupPage from './pages/SetupPage.tsx';
import RacePage from './pages/RacePage.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/race" element={<SetupPage />} />
        <Route path="/race-play" element={<RacePage />} />
        <Route path="*" element={<Navigate to="/race" />} />
      </Routes>
    </Router>
  );
}

export default App;
