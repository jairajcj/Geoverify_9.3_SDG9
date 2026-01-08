dine# GeoVerify: AI-Blockchain Sentinel for Green Asset Auditing
dine# GeoVerify: AI-Blockchain Sentinel for Green Asset Auditing
dine# GeoVerify: AI-Blockchain Sentinel for Green Asset Auditing
dine# GeoVerify: AI-Blockchain Sentinel for Green Asset Auditing

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
