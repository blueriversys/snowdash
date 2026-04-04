import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LeadEntry from      './pages/LeadEntry';
import Login from          './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import SuccessPage from    './pages/SuccessPage'; 
import CancelPage from    './pages/CancelPage'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<LeadEntry />} />
        <Route path="/success" element={<SuccessPage />} /> 
        <Route path="/cancel" element={<CancelPage />} /> 
        
        {/* Admin routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
