// backend/server.js or supabase/functions/snowdash-api/index.js
require('dotenv').config(); 
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get('/', (req, res) => {
  res.send('❄️ SnowDash API is running and ready for leads!');
});

// Health Check
app.get('/health', (req, res) => res.send('SnowDash API is running'));

// Endpoint to handle lead submission
// app.post('/submit-lead', async (req, res) => {
//   const { 
//     firstName, lastName, middleName, 
//     street, complement, city, state, zip, // New fields
//     phone, email, customerType, squareFootage, commitmentAmount 
//   } = req.body;

//   const { data, error } = await supabase
//     .from('leads')
//     .insert([{ 
//       first_name: firstName,
//       last_name: lastName,
//       middle_name: middleName,
//       street, 
//       complement, 
//       city, 
//       state, 
//       zip,
//       phone,
//       email,
//       customer_type: customerType,
//       square_footage: squareFootage,
//       commitment_amount: commitmentAmount
//     }]);

//   if (error) {
//     console.error(error);
//     return res.status(400).json({ error: error.message });
//   }
//   return res.status(201).json({ message: 'Success!' });
// });




app.post('/submit-lead', async (req, res) => {
  const { 
    firstName, lastName, middleName, 
    street, complement, city, state, zip,
    phone, email, customerType, squareFootage, commitmentAmount 
  } = req.body;

  try {
    // 1. Create the lead in Supabase first (as 'pending' payment)
    const { data: lead, error: dbError } = await supabase
      .from('leads')
      .insert([{ 
        first_name: firstName, last_name: lastName, middle_name: middleName,
        street, complement, city, state, zip, phone, email,
        customer_type: customerType, square_footage: squareFootage, 
        commitment_amount: commitmentAmount,
        payment_status: 'pending' // You should add this column to your SQL
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    // 2. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `SnowDash Commitment - ${firstName} ${lastName}`,
              description: `Plow service for ${squareFootage} sqft`,
            },
            unit_amount: Math.round(commitmentAmount * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Redirect back to your Vercel URL
      success_url: `${process.env.FRONTEND_URL}/?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/?canceled=true`,
      customer_email: email,
      client_reference_id: lead.id, // Links the payment to the database record
    });

    // 3. Return the Stripe URL to the frontend
    res.json({ url: session.url });

  } catch (error) {
    console.error("Stripe/DB Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});





// Admin endpoint to fetch all leads (Requires Valid Auth Token)
app.get('/admin/leads', async (req, res) => {
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});