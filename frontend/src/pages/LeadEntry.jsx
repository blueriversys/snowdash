import React, { useState } from 'react';

export default function LeadEntry() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    street: '', complement: '', city: '', state: '', zip: '', // Updated
    phone: '',
    email: '',
    customerType: 'Residential',
    squareFootage: '',
    commitmentAmount: ''
  });

  const [status, setStatus] = useState('');

  // One function to handle all input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');

    try {
      const response = await fetch('http://localhost:3000/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('✅ Success! Your commitment has been recorded.');
        // Reset form
        setFormData({
          firstName: '', lastName: '', middleName: '',
          street: '', complement: '', city: '', state: '', zip: '',
          phone: '', email: '',
          customerType: 'Residential', squareFootage: '', commitmentAmount: ''
        });
      } else {
        const errData = await response.json();
        setStatus(`❌ Error: ${errData.error || 'Check backend console'}`);
      }
    } catch (err) {
      setStatus('❌ Backend not running. Please start Terminal 1.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">SnowDash ❄️</h1>
        <p className="text-gray-600 mb-8">Enter your details to benefit from early commitment.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Names */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Middle Name</label>
              <input name="middleName" value={formData.middleName} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
            </div>
          </div>

          {/* Row 2: Address */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                <input name="street" value={formData.street} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700">Complement (Apt, Suite, etc.)</label>
                <input name="complement" value={formData.complement} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input name="city" value={formData.city} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input name="state" value={formData.state} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                <input name="zip" value={formData.zip} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
                </div>
            </div>
          </div>

          {/* Row 3: Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
            </div>
          </div>

          {/* Row 4: Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Type</label>
              <select name="customerType" value={formData.customerType} onChange={handleChange} className="w-full border p-2 rounded mt-1 bg-white">
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Square Footage</label>
              <input name="squareFootage" type="number" value={formData.squareFootage} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Commitment ($)</label>
              <input name="commitmentAmount" type="number" value={formData.commitmentAmount} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-4">
            Submit Commitment
          </button>

          {status && (
            <div className={`mt-4 p-3 rounded text-center font-medium ${status.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
    
  );
}