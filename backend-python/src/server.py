import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
import stripe

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Enable CORS - allow your Vercel/Localhost frontend
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

print(f"frontend url: {os.environ.get('FRONTEND_URL')}")
print(f"supabase url: {os.environ.get('SUPABASE_URL')}")
print(f"stripe secret key: {os.environ.get('STRIPE_SECRET_KEY')}")

# Initialize Stripe
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

@app.route('/', methods=['GET'])
def health_check():
    return "❄️ SnowDash Python API is running and thread-safe!"

@app.route('/submit-lead', methods=['POST'])
def submit_lead():
    print("Received lead submission request")

    try:
        data = request.json
        
        # Get the value
        sq_ft = data.get("squareFootage")
        
        # Logic: If it's an empty string or None, set it to None (SQL NULL)
        # Otherwise, convert it to a float/int
        if sq_ft == "" or sq_ft is None:
            processed_sq_ft = None
        else:
            try:
                processed_sq_ft = float(sq_ft)
            except ValueError:
                processed_sq_ft = None

        # 1. Insert into Supabase
        # Mapping frontend camelCase to database snake_case
        lead_entry = {
            "first_name": data.get("firstName"),
            "last_name": data.get("lastName"),
            "middle_name": data.get("middleName"),
            "street": data.get("street"),
            "complement": data.get("complement"),
            "city": data.get("city"),
            "state": data.get("state"),
            "zip": data.get("zip"),
            "phone": data.get("phone"),
            "email": data.get("email"),
            "customer_type": data.get("customerType"),
            "square_footage": processed_sq_ft,
            "commitment_amount": data.get("commitmentAmount"),
            "payment_status": "pending"
        }

        # Thread-safe database insert
        response = supabase.table("leads").insert(lead_entry).execute()

        #print("Database insert response:", response.data)

        if not response.data:
            return jsonify({"error": "Failed to save lead"}), 400
        
        new_lead = response.data[0]

        # 2. Create Stripe Checkout Session
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f"SnowDash commitment for {lead_entry['first_name']}",
                        },
                        'unit_amount': int(float(lead_entry['commitment_amount']) * 100),
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=f"{os.environ.get("FRONTEND_URL")}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{os.environ.get("FRONTEND_URL")}",
            customer_email=lead_entry['email'],
            client_reference_id=new_lead['id']
        )

        # print(f"success url: {checkout_session.success_url}")
        # print(f"cancel url: {checkout_session.cancel_url}")
        # print("Stripe Checkout Session created:", checkout_session)
        return jsonify({"url": checkout_session.url})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/verify-payment', methods=['POST'])
def verify_payment():
    session_id = request.json.get("session_id")
    print(f"Verifying payment for session_id: {session_id}")

    try:
        # Ask Stripe for the truth
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status == "paid":
            lead_id = session.client_reference_id
            # Update Supabase to 'paid'
            supabase.table("leads").update({"payment_status": "paid"}).eq("id", lead_id).execute()
            return jsonify({"status": "paid", "message": "Payment verified!"})
        
        return jsonify({"status": "unpaid"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/admin/leads', methods=['GET'])
def get_leads():
    try:
        # Fetch data from Supabase
        response = supabase.table("leads").select("*").order("created_at", desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # For local development: multi-threaded mode enabled
    app.run(port=3000, threaded=True, debug=True)
    