// backend/server.js or supabase/functions/snowdash-api/index.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Health Check
app.get('/health', (req, res) => res.send('SnowDash API is running'));

// Endpoint to handle lead submission
app.post('/submit-lead', async (req, res) => {
  const { 
    first_name, last_name, middle_name, full_address, 
    phone, email, customer_type, square_footage, commitment_amount 
  } = req.body;

  const { data, error } = await supabase
    .from('leads')
    .insert([{ 
      first_name, last_name, middle_name, full_address, 
      phone, email, customer_type, square_footage, commitment_amount 
    }]);

  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json({ message: 'Lead captured successfully!', data });
});

// Admin endpoint to fetch all leads (Requires Valid Auth Token)
app.get('/admin/leads', async (req, res) => {
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
