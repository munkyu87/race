import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import SetupPage from './pages/SetupPage';
import RacePage from './pages/RacePage';
import ResultPage from './pages/ResultPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/race" element={<SetupPage />} />
        <Route path="/race-play" element={<RacePage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="*" element={<Navigate to="/race" />} />
      </Routes>
    </Router>
  );
}

export default App;
