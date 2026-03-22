import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LeadEntry from      './pages/LeadEntry';
import Login from          './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<LeadEntry />} />
        
        {/* Admin routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
