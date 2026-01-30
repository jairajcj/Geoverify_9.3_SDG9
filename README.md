 GeoVerify: AI-Blockchain Sentinel for Green Asset Auditing
## Project Overview
GeoVerify is a high-efficiency system designed to solve the problem of carbon credit forgery using a dual-layer technology stack:
1.  **AI Layer (Geospatial Verification)**: Uses computer vision to analyze satellite imagery and verify the existence and health of green assets (forests).
2.  **Blockchain Layer (Immutable Auditing)**: Records verification results on a tamper-proof ledger, ensuring a "Chain of Custody" for every carbon credit.

## Architecture
- **Frontend**: HTML5, CSS3, JavaScript - A lightweight, responsive dashboard for auditors and buyers.
- **Backend**: Python (Flask) - Handles the "Sentinel" logic and Blockchain API.
    - **AI Engine**: Efficient image processing to calculate green cover.
    - **Ledger Core**: A lightweight cryptographic ledger to store verification hashes.

##  For Judges: Demo Capabilities
To demonstrate the system's "Verified" vs "Flagged" logic, use these specific coordinates:

###   For a "Verified" Result (The Golden Ticket)
These coordinates simulate a protected, high-density forest region.
*   **Latitude**: `11.4102`
*   **Longitude**: `76.6950`
*   **Expected Result**: `VERIFIED` with "High Density Forest Detected".

###  For a "Flagged" Result
Any other random coordinate will likely be flagged if the green cover is insufficient in the simulation.
*   **Example**: `0.0000`, `0.0000`
*   **Expected Result**: `FLAGGED` with "Insufficient Green Cover".

##  The Problem: "The Phantom Forest" Crisis
The global Carbon Credit market suffers from three critical failures:
1.  **Greenwashing & Forgery**: Credits are often sold for forests that have been cut down or never existed (Phantom Forests).
2.  **Double Spending**: Without a central source of truth, the same environmental asset acts as collateral for multiple different buyers.
3.  **Audit Inefficiency**: Traditional verification relies on manual human inspection, which is slow, expensive, and prone to corruption.

  The Solution: GeoVerify Protocol
We solved these problems by replacing human auditors with **deterministic code**:

 1. Trusted Verification (The "AI Sentinel")
*   **How it works**: We built a Python-based Geospatial Sentinel that analyzes satellite imagery coordinates in real-time. 
*   **The Fix**: Instead of trusting a document, the system calculates the **Green Cover Percentage** mathematically. If the forest isn't visible in the data, the credit is rejected.

 2. Immutable Truth (The "Ledger")
*   **How it works**: Every verification result is hashed (SHA-256) and linked to the previous record in a custom lightweight Blockchain.
*   **The Fix**: This solves **Double Spending**. Once a coordinate is audited and recorded in block #N, its history is permanent. A bad actor cannot sell that same land again without the detailed history being visible.

### 3. Computational Efficiency
*   **The Innovation**: Existing solutions use heavy blockchains (Ethereum) and heavy AI models.
*   **Our Approach**: We engineered a custom, lightweight "Proof of Authority" ledger that runs on standard CPU hardware, paired with optimized numerical analysis (NumPy-based) for image processing. This makes the system virtually free to run while maintaining 100% trust.

##  How to Run the Software

 Prerequisites
*   **Python 3.8+** must be installed on your system.

 Step-by-Step Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/jairajcj/GeoVerify.git
    cd GeoVerify
    ```

2.  **Install Dependencies**
    We use a unified requirements file to manage all dependencies (Flask, NumPy, etc.).
    ```bash
    pip install -r requirements.txt
    ```

 Running the Application

Option A: One-Click Start (Windows)**
*   Double-click the `run_project.bat` file in the root directory.

Option B: Manual Start (Terminal)**
*   Run the following command in your terminal:
    ```bash
    python app.py
    ```
works 
 Accessing the Dashboard
Once the server is running, open your web browser and navigate to:
 **http://127.0.0.1:5000**

1.  Enter Coordinates**: Input a Latitude/Longitude (or use the defaults).
2.  Click "Initiate Scan"**: The AI Sentinel will analyze the location.
3.  View Results**: Watch the "Green Cover" metrics update in real-time.
4.  *Check the Ledger**: See the new block appear in the "Immutable Ledger Stream" below.
5. not only works on a situated land coordinates it works on all as in the similarity to the geolocation findings 

## 🏭 NEW: B2B Carbon Credit Marketplace

GeoVerify now includes a **comprehensive blockchain-based marketplace** for manufacturing companies to trade verified carbon credits in a B2B environment.

### Marketplace Features

1. **Company Registration**
   - Register your manufacturing company on the platform
   - Get a unique Company ID for trading
   - Track your trading history and reputation

2. **Sell Carbon Credits**
   - List verified carbon credits for sale
   - Set your own pricing per credit
   - Include verification data from GeoVerify Sentinel
   - Automatic blockchain recording of all listings

3. **Buy Carbon Credits**
   - Browse active listings from verified sellers
   - Filter by price and amount
   - Automatic order matching with best prices
   - Instant blockchain-verified transactions

4. **Market Analytics**
   - Real-time market statistics
   - Total trading volume tracking
   - Average price per credit
   - Active listings and transaction counts

### How to Use the Marketplace

1. **Access the Marketplace**
   - Navigate to **http://127.0.0.1:5000/marketplace**
   - Or click "Marketplace" in the sidebar

2. **Initialize Demo Data** (Optional)
   - Use the demo data endpoint to populate the marketplace:
   ```bash
   curl -X POST http://127.0.0.1:5000/api/marketplace/init-demo
   ```

3. **Register Your Company**
   - Click "Register Company" button
   - Fill in company details (name, industry, country)
   - Save your Company ID for future transactions

4. **List Credits for Sale**
   - Click "Sell Credits" button
   - Enter your Company ID
   - Specify credit amount and price
   - Add location and description
   - Submit to create listing

5. **Purchase Credits**
   - Browse active listings
   - Click "Buy Now" on any listing
   - Enter your Company ID
   - Transaction is automatically recorded on blockchain

### Complete Workflow

```
1. Verify Location (Dashboard)
   ↓
2. Get VERIFIED/FLAGGED Status
   ↓
3. Calculate Carbon Credits
   ↓
4. List Credits on Marketplace
   ↓
5. B2B Trading Begins
   ↓
6. All Transactions Recorded on Blockchain
```

### API Endpoints

**Marketplace APIs:**
- `POST /api/marketplace/register` - Register a company
- `POST /api/marketplace/create-listing` - Create a listing
- `GET /api/marketplace/listings` - Get all listings
- `POST /api/marketplace/buy` - Create buy order
- `GET /api/marketplace/transactions` - Get transaction history
- `GET /api/marketplace/stats` - Get market statistics
- `GET /api/marketplace/company/<id>` - Get company profile

**Verification APIs:**
- `POST /api/verify` - Verify location and calculate credits
- `POST /api/estimate` - Estimate credits without blockchain
- `GET /api/audit-log` - View audit log
- `GET /api/sentinel-log` - View sentinel activity

## Technology Stack

- **Frontend**: HTML5, CSS3 (with Glassmorphism), Vanilla JavaScript
- **Backend**: Python 3.8+ (Flask Framework)
- **AI Engine**: GeoSentinel (Geospatial Verification)
- **Blockchain**: Custom Lightweight Blockchain
- **Marketplace**: B2B Trading Platform with Order Matching
 
