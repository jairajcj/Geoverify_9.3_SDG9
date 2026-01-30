from flask import Flask, render_template, jsonify, request
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
from core.blockchain import Blockchain
from core.verifier import GeoSentinel
from core.marketplace import CarbonMarketplace

app = Flask(__name__)

# Initialize Core Components
blockchain = Blockchain()
sentinel = GeoSentinel()
marketplace = CarbonMarketplace(blockchain)

# Email Configuration (Use environment variables for security)
# To use Gmail: Create an App Password at https://myaccount.google.com/apppasswords
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "your-email@gmail.com")
SENDER_PASSWORD = os.environ.get("SENDER_PASSWORD", "your-app-password")

def send_real_email(receiver_email, subject, body):
    """Sends an actual email using smtplib"""
    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = receiver_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, receiver_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"FAILED TO SEND EMAIL: {e}")
        return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/verify', methods=['POST'])
def verify_asset():
    data = request.json
    lat = float(data.get('lat', 0))
    lon = float(data.get('lon', 0))
    
    # 1. AI Verification
    verification_result = sentinel.verify_location(lat, lon)
    
    # 2. Blockchain Recording (Mining)
    # In a real app, this would be more complex. Here we simulate mining a block for this transaction.
    last_block = blockchain.get_last_block()
    proof = last_block['proof'] + 1 # Simplified Proof of Work
    previous_hash = blockchain.hash(last_block)
    
    new_block = blockchain.create_block(proof, previous_hash)
    new_block['data'].append(verification_result) # Add the data to the block
    
    return jsonify({
        "verification": verification_result,
        "block_index": new_block['index'],
        "block_hash": blockchain.hash(new_block)
    })

@app.route('/api/estimate', methods=['POST'])
def estimate_credits():
    data = request.json
    lat = float(data.get('lat', 0))
    lon = float(data.get('lon', 0))
    
    # AI Verification (Estimation only)
    estimation = sentinel.verify_location(lat, lon)
    
    return jsonify({
        "estimation": estimation
    })


@app.route('/api/chain', methods=['GET'])
def get_chain():
    response = {
        'chain': blockchain.chain,
        'length': len(blockchain.chain)
    }
    return jsonify(response)

@app.route('/api/audit-log', methods=['GET'])
def get_audit_log():
    """Returns a detailed audit log of all blockchain transactions"""
    audit_entries = []
    
    for block in blockchain.chain:
        for data_entry in block.get('data', []):
            audit_entries.append({
                'timestamp': block['timestamp'],
                'block_index': block['index'],
                'block_hash': blockchain.hash(block)[:16] + '...',
                'location': f"({data_entry.get('latitude', 'N/A')}, {data_entry.get('longitude', 'N/A')})",
                'status': data_entry.get('status', 'UNKNOWN'),
                'carbon_credits': data_entry.get('carbon_credits', 0),
                'green_cover': data_entry.get('green_cover_percentage', 0)
            })
    
    return jsonify({
        'total_entries': len(audit_entries),
        'entries': audit_entries
    })

@app.route('/api/sentinel-log', methods=['GET'])
def get_sentinel_log():
    """Returns sentinel verification activity logs"""
    # Get verification history from sentinel
    sentinel_logs = sentinel.get_verification_history()
    
    return jsonify({
        'total_verifications': len(sentinel_logs),
        'logs': sentinel_logs,
        'sentinel_status': 'ACTIVE',
        'ai_model_version': '2.1.0'
    })

# ============ MARKETPLACE API ENDPOINTS ============

@app.route('/api/marketplace/register', methods=['POST'])
def register_company():
    """Register a company on the marketplace"""
    data = request.json
    company_id = marketplace.register_company(
        company_name=data.get('company_name'),
        industry=data.get('industry'),
        country=data.get('country'),
        email=data.get('email'),
        wallet_address=data.get('wallet_address', 'DEMO_WALLET')
    )
    
    return jsonify({
        'success': True,
        'company_id': company_id,
        'message': 'Company registered successfully'
    })

@app.route('/api/marketplace/inquiry', methods=['POST'])
def send_inquiry():
    """Send an inquiry for a listing"""
    data = request.json
    listing_id = data.get('listing_id')
    buyer_id = data.get('buyer_id')
    
    # 1. Get info from logic layer
    result = marketplace.send_inquiry(listing_id, buyer_id)
    
    if result.get('success'):
        # 2. Try to send real email
        seller_email = result.get('seller_email')
        subject = f"GeoVerify: New Inquiry for Listing {listing_id}"
        body = f"""
Hello,

You have a new inquiry for your carbon credit listing on GeoVerify.

Listing ID: {listing_id}
Buyer ID: {buyer_id}

Please login to your dashboard to respond to this inquiry.

Best regards,
GeoVerify Sentinel System
        """
        email_sent = send_real_email(seller_email, subject, body)
        result['real_email_sent'] = email_sent
        if not email_sent:
            result['warning'] = "Real email failed to send. Check SMTP credentials in app.py or environment variables."
            
    return jsonify(result)

@app.route('/api/marketplace/create-listing', methods=['POST'])
def create_listing():
    """Create a new carbon credit listing"""
    data = request.json
    
    result = marketplace.create_listing(
        seller_id=data.get('seller_id'),
        credit_amount=float(data.get('credit_amount')),
        price_per_credit=float(data.get('price_per_credit')),
        verification_data=data.get('verification_data', {}),
        location=data.get('location', 'Unknown'),
        description=data.get('description', '')
    )
    
    return jsonify(result)

@app.route('/api/marketplace/listings', methods=['GET'])
def get_marketplace_listings():
    """Get all active marketplace listings"""
    filters = {}
    
    if request.args.get('max_price'):
        filters['max_price'] = float(request.args.get('max_price'))
    if request.args.get('min_amount'):
        filters['min_amount'] = float(request.args.get('min_amount'))
    
    listings = marketplace.get_active_listings(filters if filters else None)
    
    return jsonify({
        'success': True,
        'total_listings': len(listings),
        'listings': listings
    })

@app.route('/api/marketplace/buy', methods=['POST'])
def buy_credits():
    """Create a buy order for carbon credits"""
    data = request.json
    
    result = marketplace.create_buy_order(
        buyer_id=data.get('buyer_id'),
        credit_amount=float(data.get('credit_amount')),
        max_price_per_credit=float(data.get('max_price_per_credit'))
    )
    
    return jsonify(result)

@app.route('/api/marketplace/transactions', methods=['GET'])
def get_transactions():
    """Get marketplace transaction history"""
    company_id = request.args.get('company_id')
    
    transactions = marketplace.get_transaction_history(company_id)
    
    return jsonify({
        'success': True,
        'total_transactions': len(transactions),
        'transactions': transactions
    })

@app.route('/api/marketplace/stats', methods=['GET'])
def get_market_stats():
    """Get overall marketplace statistics"""
    stats = marketplace.get_market_stats()
    
    return jsonify({
        'success': True,
        'stats': stats
    })

@app.route('/api/marketplace/company/<company_id>', methods=['GET'])
def get_company_profile(company_id):
    """Get company profile and trading history"""
    profile = marketplace.get_company_profile(company_id)
    
    if not profile:
        return jsonify({'success': False, 'error': 'Company not found'}), 404
    
    return jsonify({
        'success': True,
        'profile': profile
    })

@app.route('/api/marketplace/companies', methods=['GET'])
def get_all_companies():
    """Get all registered companies"""
    companies_list = list(marketplace.companies.values())
    return jsonify({
        'success': True,
        'total_companies': len(companies_list),
        'companies': companies_list
    })

@app.route('/marketplace')
def marketplace_page():
    """Render the marketplace page"""
    return render_template('marketplace.html')

@app.route('/api/marketplace/init-demo', methods=['POST'])
def init_demo_data():
    """Initialize demo data for the marketplace"""
    # Register demo companies
    company1 = marketplace.register_company(
        "GreenTech Industries",
        "Manufacturing",
        "India",
        "0x1234...5678",
        "contact@greentech.io"
    )
    
    company2 = marketplace.register_company(
        "EcoForest Solutions",
        "Forestry",
        "Brazil",
        "0xabcd...efgh",
        "info@ecoforest.br"
    )
    
    company3 = marketplace.register_company(
        "CleanEnergy Corp",
        "Energy",
        "Germany",
        "0x9876...5432",
        "support@cleanenergy.de"
    )
    
    # Create demo listings
    marketplace.create_listing(
        seller_id=company2,
        credit_amount=150.5,
        price_per_credit=28.50,
        verification_data={'verified': True, 'ai_confidence': 95.2},
        location="Amazon Rainforest, Brazil",
        description="Premium verified carbon credits from protected rainforest area"
    )
    
    marketplace.create_listing(
        seller_id=company3,
        credit_amount=200.0,
        price_per_credit=32.00,
        verification_data={'verified': True, 'ai_confidence': 98.1},
        location="Solar Farm, Germany",
        description="High-quality credits from renewable energy production"
    )
    
    marketplace.create_listing(
        seller_id=company2,
        credit_amount=75.25,
        price_per_credit=25.00,
        verification_data={'verified': True, 'ai_confidence': 92.5},
        location="Reforestation Project, Brazil",
        description="Credits from new tree plantation initiative"
    )
    
    return jsonify({
        'success': True,
        'message': 'Demo data initialized',
        'companies': [company1, company2, company3]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)


