// backend/server.js or supabase/functions/snowdash-api/index.js
require('dotenv').config(); 
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
    firstName, lastName, middleName, 
    street, complement, city, state, zip, // New fields
    phone, email, customerType, squareFootage, commitmentAmount 
  } = req.body;

  const { data, error } = await supabase
    .from('leads')
    .insert([{ 
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName,
      street, 
      complement, 
      city, 
      state, 
      zip,
      phone,
      email,
      customer_type: customerType,
      square_footage: squareFootage,
      commitment_amount: commitmentAmount
    }]);

  if (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
  return res.status(201).json({ message: 'Success!' });
});


// Admin endpoint to fetch all leads (Requires Valid Auth Token)
app.get('/admin/leads', async (req, res) => {
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
