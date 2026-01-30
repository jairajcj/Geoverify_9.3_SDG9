document.addEventListener('DOMContentLoaded', () => {
    // Modal Elements
    const registerModal = document.getElementById('registerModal');
    const sellModal = document.getElementById('sellModal');
    const buyModal = document.getElementById('buyModal');

    // Button Elements
    const registerBtn = document.getElementById('registerCompanyBtn');
    const sellBtn = document.getElementById('sellCreditsBtn');
    const buyBtn = document.getElementById('buyCreditsBtn');
    const refreshListingsBtn = document.getElementById('refreshListingsBtn');
    const refreshTransactionsBtn = document.getElementById('refreshTransactionsBtn');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const tradersModal = document.getElementById('tradersModal');
    const activeTradersCard = document.getElementById('activeTradersCard');

    // Close buttons
    const closeButtons = document.querySelectorAll('.close-modal');

    // Open modals
    registerBtn.addEventListener('click', () => openModal(registerModal));
    sellBtn.addEventListener('click', () => openModal(sellModal));
    buyBtn.addEventListener('click', () => openModal(buyModal));
    if (activeTradersCard) {
        activeTradersCard.addEventListener('click', () => {
            openModal(tradersModal);
            loadActiveTraders();
        });
    }

    // Close modals
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            closeModal(document.getElementById(modalId));
        });
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Form submissions
    document.getElementById('registerForm').addEventListener('submit', handleRegisterCompany);
    document.getElementById('sellForm').addEventListener('submit', handleCreateListing);
    document.getElementById('buyForm').addEventListener('submit', handleBuyOrder);

    // Refresh buttons
    refreshListingsBtn.addEventListener('click', loadMarketplaceListings);
    refreshTransactionsBtn.addEventListener('click', loadTransactions);
    applyFiltersBtn.addEventListener('click', applyFilters);

    // ========== FUNCTIONS (Exposed Globally for SPA) ==========

    window.loadMarketplaceData = () => {
        loadMarketStats();
        loadMarketplaceListings();
        loadTransactions();
        loadActiveTraders(); // Keep traders list warm
    };

    // Initial load
    window.loadMarketplaceData();

    // Auto-refresh every 30 seconds
    setInterval(() => {
        window.loadMarketplaceData();
    }, 30000);

    // Internal functions remaining...

    function openModal(modal) {
        modal.classList.remove('hidden');
    }

    function closeModal(modal) {
        modal.classList.add('hidden');
        // Clear result messages
        modal.querySelectorAll('.result-message').forEach(msg => {
            msg.classList.add('hidden');
            msg.textContent = '';
        });
    }

    async function loadMarketStats() {
        try {
            const response = await fetch('/api/marketplace/stats');
            const data = await response.json();

            if (data.success) {
                const stats = data.stats;
                document.getElementById('totalVolume').textContent = `$${stats.total_volume_usd.toLocaleString()}`;
                document.getElementById('activeListings').textContent = stats.active_listings;
                document.getElementById('totalTrades').textContent = stats.total_transactions;
                document.getElementById('avgPrice').textContent = `$${stats.average_price_per_credit.toFixed(2)}`;
                document.getElementById('activeTraders').textContent = stats.total_companies;
            }
        } catch (error) {
            console.error('Error loading market stats:', error);
        }
    }

    async function loadMarketplaceListings(filters = null) {
        try {
            let url = '/api/marketplace/listings';
            if (filters) {
                const params = new URLSearchParams(filters);
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            const grid = document.getElementById('listingsGrid');

            if (!data.success || data.listings.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state-marketplace">
                        <div class="empty-icon">📦</div>
                        <p>No active listings found. Try adjusting your filters or be the first to sell!</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = '';

            data.listings.forEach(listing => {
                const card = createListingCard(listing);
                grid.appendChild(card);
            });

        } catch (error) {
            console.error('Error loading listings:', error);
        }
    }

    function createListingCard(listing) {
        const card = document.createElement('div');
        card.className = 'listing-card';

        const createdDate = new Date(listing.created_at * 1000).toLocaleDateString();

        card.innerHTML = `
            <div class="listing-header">
                <div class="listing-seller">${listing.seller_name}</div>
                <div class="listing-badge">VERIFIED SELLER</div>
            </div>
            
            <div class="listing-details">
                <div class="listing-detail-row">
                    <span class="listing-detail-label">Asset:</span>
                    <span class="listing-detail-value">Verified Carbon Credit</span>
                </div>
                <div class="listing-detail-row">
                    <span class="listing-detail-label">Quantity:</span>
                    <span class="listing-detail-value">${listing.available_amount} tCO2e</span>
                </div>
                <div class="listing-detail-row">
                    <span class="listing-detail-label">Price:</span>
                    <span class="listing-detail-value listing-price">$${listing.price_per_credit.toFixed(2)}</span>
                </div>
                <div class="listing-detail-row">
                    <span class="listing-detail-label">Location:</span>
                    <span class="listing-detail-value">${listing.location}</span>
                </div>
                ${listing.description ? `
                <div style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px dashed var(--border);">
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">${listing.description}</p>
                </div>` : ''}
            </div>
            
            <div class="listing-actions">
                <button class="btn-buy" onclick="sendInquiry('${listing.listing_id}', '${listing.seller_name}')">
                    Send Inquiry
                </button>
                <button class="btn-details" onclick="viewListingDetails('${listing.listing_id}')">
                    Full Details
                </button>
            </div>
        `;

        return card;
    }

    async function loadTransactions() {
        try {
            const response = await fetch('/api/marketplace/transactions');
            const data = await response.json();

            const list = document.getElementById('transactionsList');

            if (!data.success || data.transactions.length === 0) {
                list.innerHTML = `
                    <div class="empty-state-marketplace">
                        <div class="empty-icon">📋</div>
                        <p>No transactions yet. Start trading to see your history!</p>
                    </div>
                `;
                return;
            }

            list.innerHTML = '';

            // Show last 10 transactions
            data.transactions.slice(-10).reverse().forEach(txn => {
                const item = createTransactionItem(txn);
                list.appendChild(item);
            });

        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    }

    function createTransactionItem(txn) {
        const item = document.createElement('div');
        item.className = 'transaction-item';

        const date = new Date(txn.timestamp * 1000).toLocaleString();

        item.innerHTML = `
            <div class="transaction-icon">✅</div>
            <div class="transaction-details">
                <div class="transaction-title">
                    ${txn.buyer_name} ← ${txn.seller_name}
                </div>
                <div class="transaction-meta">
                    ${txn.transaction_id} | ${date}
                </div>
            </div>
            <div class="transaction-amount">
                <div class="transaction-value">$${txn.total_price.toLocaleString()}</div>
                <div class="transaction-credits">${txn.credit_amount} tCO2e @ $${txn.price_per_credit.toFixed(2)}</div>
            </div>
        `;

        return item;
    }

    async function loadActiveTraders() {
        const tradersList = document.getElementById('tradersList');
        if (!tradersList) return;

        try {
            const response = await fetch('/api/marketplace/companies');
            const data = await response.json();

            if (!data.success || data.companies.length === 0) {
                tradersList.innerHTML = '<div class="empty-state">No active enterprises found.</div>';
                return;
            }

            tradersList.innerHTML = '';
            data.companies.forEach(company => {
                const card = document.createElement('div');
                card.className = 'trader-card';
                card.innerHTML = `
                    <div class="trader-badge">VERIFIED</div>
                    <div class="trader-logo">🏢</div>
                    <div class="trader-info">
                        <h3>${company.name}</h3>
                        <p>${company.industry} | ${company.country}</p>
                        <p style="font-size: 0.75rem; color: var(--accent); margin-top: 0.2rem;">${company.email}</p>
                    </div>
                    <div class="trader-stats">
                        <div class="t-stat">
                            <span class="t-label">Credits Owned</span>
                            <span class="t-value">${company.credits_owned.toFixed(2)}</span>
                        </div>
                        <div class="t-stat">
                            <span class="t-label">Total Trades</span>
                            <span class="t-value">${company.total_trades}</span>
                        </div>
                    </div>
                    <button class="btn-secondary" style="margin-top: 1rem; width: 100%; font-size: 0.8rem;" onclick="viewCompanyProfile('${company.company_id}')">
                        View Profile
                    </button>
                `;
                tradersList.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading traders:', error);
            tradersList.innerHTML = '<div class="error-state">Failed to load trader data</div>';
        }
    }

    window.viewCompanyProfile = function (companyId) {
        alert("Detailed Company Profiles coming soon! ID: " + companyId);
    };

    function applyFilters() {
        const maxPrice = document.getElementById('maxPriceFilter').value;
        const minAmount = document.getElementById('minAmountFilter').value;

        const filters = {};
        if (maxPrice) filters.max_price = maxPrice;
        if (minAmount) filters.min_amount = minAmount;

        loadMarketplaceListings(filters);
    }

    async function handleRegisterCompany(e) {
        e.preventDefault();

        const resultDiv = document.getElementById('registrationResult');
        resultDiv.classList.add('hidden');

        const formData = {
            company_name: document.getElementById('companyName').value,
            industry: document.getElementById('industry').value,
            country: document.getElementById('country').value,
            email: document.getElementById('companyEmail').value
        };

        try {
            const response = await fetch('/api/marketplace/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                resultDiv.className = 'result-message success';
                resultDiv.textContent = `✅ Success! Your Company ID: ${data.company_id}`;
                resultDiv.classList.remove('hidden');

                // Clear form
                e.target.reset();

                // Update stats
                setTimeout(() => loadMarketStats(), 1000);
            } else {
                throw new Error(data.error || 'Registration failed');
            }
        } catch (error) {
            resultDiv.className = 'result-message error';
            resultDiv.textContent = `❌ Error: ${error.message}`;
            resultDiv.classList.remove('hidden');
        }
    }

    async function handleCreateListing(e) {
        e.preventDefault();

        const resultDiv = document.getElementById('sellResult');
        resultDiv.classList.add('hidden');

        const formData = {
            seller_id: document.getElementById('sellerCompanyId').value,
            credit_amount: parseFloat(document.getElementById('creditAmount').value),
            price_per_credit: parseFloat(document.getElementById('pricePerCredit').value),
            location: document.getElementById('creditLocation').value || 'Unknown',
            description: document.getElementById('creditDescription').value,
            verification_data: {
                verified: true,
                source: 'GeoVerify Sentinel'
            }
        };

        try {
            const response = await fetch('/api/marketplace/create-listing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                resultDiv.className = 'result-message success';
                resultDiv.textContent = `✅ Listing created! ID: ${data.listing.listing_id}`;
                resultDiv.classList.remove('hidden');

                // Clear form
                e.target.reset();

                // Refresh listings
                setTimeout(() => {
                    loadMarketplaceListings();
                    loadMarketStats();
                }, 1000);
            } else {
                throw new Error(data.error || 'Failed to create listing');
            }
        } catch (error) {
            resultDiv.className = 'result-message error';
            resultDiv.textContent = `❌ Error: ${error.message}`;
            resultDiv.classList.remove('hidden');
        }
    }

    async function handleBuyOrder(e) {
        e.preventDefault();

        const resultDiv = document.getElementById('buyResult');
        resultDiv.classList.add('hidden');

        const formData = {
            buyer_id: document.getElementById('buyerCompanyId').value,
            credit_amount: parseFloat(document.getElementById('buyAmount').value),
            max_price_per_credit: parseFloat(document.getElementById('maxPrice').value)
        };

        try {
            const response = await fetch('/api/marketplace/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                if (data.match && data.match.matched) {
                    resultDiv.className = 'result-message success';
                    resultDiv.textContent = `✅ Order matched! Transaction ID: ${data.match.transaction.transaction_id}`;
                } else {
                    resultDiv.className = 'result-message info';
                    resultDiv.textContent = `ℹ️ Order placed. ${data.match.reason}`;
                }
                resultDiv.classList.remove('hidden');

                // Clear form
                e.target.reset();

                // Refresh data
                setTimeout(() => {
                    loadMarketplaceListings();
                    loadTransactions();
                    loadMarketStats();
                }, 1000);
            } else {
                throw new Error(data.error || 'Failed to create buy order');
            }
        } catch (error) {
            resultDiv.className = 'result-message error';
            resultDiv.textContent = `❌ Error: ${error.message}`;
            resultDiv.classList.remove('hidden');
        }
    }

    // Global functions for inline onclick handlers
    window.sendInquiry = function (listingId, sellerName) {
        const buyerCompanyId = prompt(`Enter your Company ID to send inquiry to ${sellerName}:`);
        if (!buyerCompanyId) return;

        fetch('/api/marketplace/inquiry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                listing_id: listingId,
                buyer_id: buyerCompanyId
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert(`✅ Inquiry successfully sent to ${sellerName} (${data.seller_email})!\n\nThey have been notified that you are interested in their product.`);
                    loadMarketplaceListings();
                } else {
                    alert(`❌ Error: ${data.error}`);
                }
            })
            .catch(error => {
                alert(`❌ Error: ${error.message}`);
            });
    };

    window.quickBuy = function (listingId, amount, price) {
        const buyerCompanyId = prompt('Enter your Company ID to purchase:');
        if (!buyerCompanyId) return;

        fetch('/api/marketplace/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                buyer_id: buyerCompanyId,
                credit_amount: amount,
                max_price_per_credit: price
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.match && data.match.matched) {
                    alert(`✅ Purchase successful! Transaction ID: ${data.match.transaction.transaction_id}`);
                    loadMarketplaceListings();
                    loadTransactions();
                    loadMarketStats();
                } else {
                    alert(`ℹ️ ${data.match ? data.match.reason : 'Order placed'}`);
                }
            })
            .catch(error => {
                alert(`❌ Error: ${error.message}`);
            });
    };

    window.viewListingDetails = function (listingId) {
        alert(`Viewing details for listing: ${listingId}\n\nFull details feature coming soon!`);
    };
});
