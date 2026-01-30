import time
import random
import hashlib
from datetime import datetime

class CarbonMarketplace:
    """
    B2B Carbon Credit Trading Platform for Manufacturing Industry
    Enables verified carbon credits to be listed, bought, and sold on blockchain
    """
    
    def __init__(self, blockchain):
        self.blockchain = blockchain
        self.listings = []  # Active marketplace listings
        self.orders = []    # Buy/Sell orders
        self.transactions = []  # Completed transactions
        self.companies = {}  # Registered companies
        self.listing_id_counter = 1000
        self.order_id_counter = 2000
        self.transaction_id_counter = 3000
        
    def register_company(self, company_name, industry, country, wallet_address, email=None):
        """Register a manufacturing company on the platform"""
        company_id = hashlib.sha256(f"{company_name}{time.time()}".encode()).hexdigest()[:12]
        
        self.companies[company_id] = {
            'company_id': company_id,
            'name': company_name,
            'industry': industry,
            'country': country,
            'email': email or f"contact@{company_name.lower().replace(' ', '')}.com",
            'wallet_address': wallet_address,
            'verified': True,
            'credits_owned': 0,
            'credits_sold': 0,
            'total_trades': 0,
            'reputation_score': 100,
            'joined_date': time.time()
        }
        
        return company_id

    def send_inquiry(self, listing_id, buyer_id):
        """Simulate sending an inquiry email to the seller"""
        listing = next((l for l in self.listings if l['listing_id'] == listing_id), None)
        if not listing:
            return {"success": False, "error": "Listing not found"}
            
        seller = self.companies.get(listing['seller_id'])
        buyer = self.companies.get(buyer_id)
        
        if not seller or not buyer:
            return {"success": False, "error": "Seller or Buyer not found"}
            
        listing['interested_buyers'] += 1
        
        # Simulate email notification
        print(f"NOTIFICATION: Sending email to {seller['email']}")
        print(f"Subject: New Inquiry for your Carbon Credit Listing {listing_id}")
        print(f"Message: Hello {seller['name']}, a buyer ({buyer['name']}) is interested in your listing in {listing['location']}.")
        
        return {
            "success": True, 
            "message": f"Inquiry sent to {seller['name']}",
            "seller_email": seller['email']
        }
    
    def create_listing(self, seller_id, credit_amount, price_per_credit, 
                       verification_data, location, description=""):
        """Create a new carbon credit listing for sale"""
        
        if seller_id not in self.companies:
            return {"success": False, "error": "Company not registered"}
        
        listing_id = f"LST-{self.listing_id_counter}"
        self.listing_id_counter += 1
        
        listing = {
            'listing_id': listing_id,
            'seller_id': seller_id,
            'seller_name': self.companies[seller_id]['name'],
            'credit_amount': credit_amount,
            'available_amount': credit_amount,
            'price_per_credit': price_per_credit,
            'total_value': credit_amount * price_per_credit,
            'verification_data': verification_data,
            'location': location,
            'description': description,
            'status': 'ACTIVE',
            'created_at': time.time(),
            'expires_at': time.time() + (30 * 24 * 60 * 60),  # 30 days
            'views': 0,
            'interested_buyers': 0
        }
        
        self.listings.append(listing)
        
        # Record on blockchain
        block_data = {
            'type': 'LISTING_CREATED',
            'listing_id': listing_id,
            'seller': self.companies[seller_id]['name'],
            'amount': credit_amount,
            'price': price_per_credit,
            'timestamp': time.time()
        }
        
        return {
            'success': True,
            'listing': listing,
            'message': f'Listing {listing_id} created successfully'
        }
    
    def create_buy_order(self, buyer_id, credit_amount, max_price_per_credit):
        """Create a buy order for carbon credits"""
        
        if buyer_id not in self.companies:
            return {"success": False, "error": "Company not registered"}
        
        order_id = f"ORD-{self.order_id_counter}"
        self.order_id_counter += 1
        
        order = {
            'order_id': order_id,
            'buyer_id': buyer_id,
            'buyer_name': self.companies[buyer_id]['name'],
            'credit_amount': credit_amount,
            'max_price_per_credit': max_price_per_credit,
            'status': 'PENDING',
            'created_at': time.time(),
            'matched_listing': None
        }
        
        self.orders.append(order)
        
        # Try to match with existing listings
        match_result = self._match_order(order)
        
        return {
            'success': True,
            'order': order,
            'match': match_result
        }
    
    def _match_order(self, order):
        """Automatically match buy orders with suitable listings"""
        
        # Find listings that match the criteria
        suitable_listings = [
            listing for listing in self.listings
            if listing['status'] == 'ACTIVE'
            and listing['available_amount'] >= order['credit_amount']
            and listing['price_per_credit'] <= order['max_price_per_credit']
        ]
        
        if not suitable_listings:
            return {'matched': False, 'reason': 'No suitable listings found'}
        
        # Sort by best price
        suitable_listings.sort(key=lambda x: x['price_per_credit'])
        best_listing = suitable_listings[0]
        
        # Execute transaction
        transaction = self.execute_transaction(
            order['buyer_id'],
            best_listing['seller_id'],
            best_listing['listing_id'],
            order['credit_amount'],
            best_listing['price_per_credit']
        )
        
        return {
            'matched': True,
            'listing': best_listing,
            'transaction': transaction
        }
    
    def execute_transaction(self, buyer_id, seller_id, listing_id, 
                           credit_amount, price_per_credit):
        """Execute a carbon credit transaction"""
        
        transaction_id = f"TXN-{self.transaction_id_counter}"
        self.transaction_id_counter += 1
        
        total_price = credit_amount * price_per_credit
        
        transaction = {
            'transaction_id': transaction_id,
            'buyer_id': buyer_id,
            'buyer_name': self.companies[buyer_id]['name'],
            'seller_id': seller_id,
            'seller_name': self.companies[seller_id]['name'],
            'listing_id': listing_id,
            'credit_amount': credit_amount,
            'price_per_credit': price_per_credit,
            'total_price': total_price,
            'status': 'COMPLETED',
            'timestamp': time.time(),
            'blockchain_hash': None
        }
        
        # Update listing
        for listing in self.listings:
            if listing['listing_id'] == listing_id:
                listing['available_amount'] -= credit_amount
                if listing['available_amount'] == 0:
                    listing['status'] = 'SOLD_OUT'
                break
        
        # Update company stats
        self.companies[buyer_id]['credits_owned'] += credit_amount
        self.companies[buyer_id]['total_trades'] += 1
        
        self.companies[seller_id]['credits_sold'] += credit_amount
        self.companies[seller_id]['total_trades'] += 1
        
        # Record on blockchain
        last_block = self.blockchain.get_last_block()
        proof = last_block['proof'] + 1
        previous_hash = self.blockchain.hash(last_block)
        
        new_block = self.blockchain.create_block(proof, previous_hash)
        new_block['data'].append({
            'type': 'CARBON_CREDIT_TRADE',
            'transaction_id': transaction_id,
            'buyer': self.companies[buyer_id]['name'],
            'seller': self.companies[seller_id]['name'],
            'amount': credit_amount,
            'price': price_per_credit,
            'total_value': total_price,
            'timestamp': time.time()
        })
        
        transaction['blockchain_hash'] = self.blockchain.hash(new_block)
        
        self.transactions.append(transaction)
        
        return transaction
    
    def get_active_listings(self, filters=None):
        """Get all active marketplace listings with optional filters"""
        active = [l for l in self.listings if l['status'] == 'ACTIVE']
        
        if filters:
            if 'max_price' in filters:
                active = [l for l in active if l['price_per_credit'] <= filters['max_price']]
            if 'min_amount' in filters:
                active = [l for l in active if l['available_amount'] >= filters['min_amount']]
        
        return sorted(active, key=lambda x: x['created_at'], reverse=True)
    
    def get_transaction_history(self, company_id=None):
        """Get transaction history, optionally filtered by company"""
        if company_id:
            return [
                t for t in self.transactions
                if t['buyer_id'] == company_id or t['seller_id'] == company_id
            ]
        return self.transactions
    
    def get_market_stats(self):
        """Get overall marketplace statistics"""
        total_volume = sum(t['total_price'] for t in self.transactions)
        total_credits_traded = sum(t['credit_amount'] for t in self.transactions)
        
        avg_price = total_volume / total_credits_traded if total_credits_traded > 0 else 0
        
        return {
            'total_companies': len(self.companies),
            'active_listings': len([l for l in self.listings if l['status'] == 'ACTIVE']),
            'total_transactions': len(self.transactions),
            'total_volume_usd': round(total_volume, 2),
            'total_credits_traded': round(total_credits_traded, 2),
            'average_price_per_credit': round(avg_price, 2),
            'last_updated': time.time()
        }
    
    def get_company_profile(self, company_id):
        """Get detailed company profile"""
        if company_id not in self.companies:
            return None
        
        company = self.companies[company_id].copy()
        
        # Add transaction history
        company['transactions'] = self.get_transaction_history(company_id)
        company['active_listings'] = [
            l for l in self.listings 
            if l['seller_id'] == company_id and l['status'] == 'ACTIVE'
        ]
        
        return company
