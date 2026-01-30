from flask import Flask, render_template, jsonify, request
from core.blockchain import Blockchain
from core.verifier import GeoSentinel

app = Flask(__name__)

# Initialize Core Components
blockchain = Blockchain()
sentinel = GeoSentinel()

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
