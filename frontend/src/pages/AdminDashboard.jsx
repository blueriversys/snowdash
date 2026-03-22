import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom'; // Added for redirect

export default function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize the redirect hook

  useEffect(() => {
    checkUser();
    fetchLeads();
  }, []);

  // Security: If no one is logged in, send them back to login
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
    }
  };

  const fetchLeads = async () => {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setLeads(data);
    }
    setLoading(false);
  };

  // IMPROVED LOGOUT FUNCTION
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Error logging out");
    } else {
      // This forces the browser to go back to the login page
      navigate('/login');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">SnowDash Admin</h1>
            <p className="text-gray-500">Customer Commitment List</p>
          </div>
          
          {/* CHANGED: Red color and explicit click handler */}
          <button 
            onClick={handleLogout} 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-md active:transform active:scale-95"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-slate-800 text-white text-left text-xs font-semibold uppercase tracking-wider">
                <th className="px-5 py-4 border-b">Customer Name</th>
                <th className="px-5 py-4 border-b">Address</th>
                <th className="px-5 py-4 border-b">Phone</th>
                <th className="px-5 py-4 border-b">Email</th>
                <th className="px-5 py-4 border-b">Type</th>
                <th className="px-5 py-4 border-b">Sq Ft</th>
                <th className="px-5 py-4 border-b">Commitment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {lead.last_name}, {lead.first_name}
                    </td>
                    
                    {/* Updated Address Cell */}
                    <td className="px-5 py-4 text-sm text-gray-600">
                      <div className="font-semibold">{lead.street}</div>
                      {lead.complement && <div className="text-xs text-gray-400">{lead.complement}</div>}
                      <div className="text-xs">
                        {lead.city}, {lead.state} {lead.zip}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {lead.phone}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {lead.email}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${lead.customer_type === 'Commercial' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                        {lead.customer_type}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">{lead.square_footage}</td>
                    <td className="px-5 py-4 text-sm font-bold text-blue-600">${lead.commitment_amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-gray-400">No customers have signed up yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}