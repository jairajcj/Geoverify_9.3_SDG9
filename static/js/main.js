document.addEventListener('DOMContentLoaded', () => {
    const verifyBtn = document.getElementById('verifyBtn');
    const scanningOverlay = document.querySelector('.scanning-overlay');
    const visualizerText = document.querySelector('.placeholder-text');
    const resultsContainer = document.getElementById('resultsContainer');
    const refreshChainBtn = document.getElementById('refreshChain');

    // UI Elements for result
    const statusVal = document.getElementById('statusValue');
    const coverVal = document.getElementById('coverValue');
    const confidVal = document.getElementById('confidenceValue');
    const ledgerFeed = document.getElementById('ledgerFeed');

    verifyBtn.addEventListener('click', async () => handleAction('/api/verify', true));
    const estimateBtn = document.getElementById('estimateBtn');
    estimateBtn.addEventListener('click', async () => handleAction('/api/estimate', false));

    async function handleAction(endpoint, isVerification) {
        const lat = document.getElementById('latInput').value;
        const lon = document.getElementById('lonInput').value;

        // Start UI Loading State
        scanningOverlay.classList.remove('hidden');
        visualizerText.textContent = isVerification ? "Acquiring Satellite Lock..." : "Calculating Potential Credits...";
        verifyBtn.disabled = true;
        estimateBtn.disabled = true;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lon })
            });
            const data = await response.json();

            // Simulate processing delay for effect
            setTimeout(() => {
                scanningOverlay.classList.add('hidden');
                visualizerText.textContent = "Operation Complete.";
                verifyBtn.disabled = false;
                estimateBtn.disabled = false;

                const resultData = isVerification ? data.verification : data.estimation;
                updateResults(resultData);

                if (isVerification) {
                    updateLedger(); // Refresh ledger only for verification
                }
            }, 1200);

        } catch (error) {
            console.error(error);
            visualizerText.textContent = "Error: Connection Failed";
            scanningOverlay.classList.add('hidden');
            verifyBtn.disabled = false;
            estimateBtn.disabled = false;
        }
    }


    refreshChainBtn.addEventListener('click', updateLedger);

    function updateResults(data) {
        statusVal.textContent = data.status;
        statusVal.setAttribute('data-status', data.status);
        coverVal.textContent = data.green_cover_percentage + '%';
        confidVal.textContent = data.ai_confidence + '%';

        const creditsVal = document.getElementById('creditsValue');
        if (creditsVal) {
            creditsVal.textContent = data.carbon_credits + ' tCO2e';
        }

        // Update the Reason Field
        const reasonEl = document.getElementById('reasonValue');
        if (data.reasons && data.reasons.length > 0) {
            reasonEl.textContent = data.reasons.join(' | ');
            reasonEl.style.color = data.status === 'VERIFIED' ? '#4CAF50' : '#ff6b6b';
        } else {
            reasonEl.textContent = 'Analysis Complete';
            reasonEl.style.color = '#aaa';
        }

        // Add "List on Marketplace" and "View Certificate" buttons if verified
        const existingBtnContainer = document.getElementById('resultActions');
        if (existingBtnContainer) existingBtnContainer.remove();

        if (data.status === 'VERIFIED') {
            const btnContainer = document.createElement('div');
            btnContainer.id = 'resultActions';
            btnContainer.style.display = 'flex';
            btnContainer.style.gap = '0.5rem';
            btnContainer.style.marginTop = '1rem';

            const listBtn = document.createElement('button');
            listBtn.className = 'btn-primary';
            listBtn.style.flex = '1';
            listBtn.innerHTML = '<span>🚀 List on Market</span>';
            listBtn.onclick = () => {
                // Switch to marketplace view
                document.getElementById('dashboardView').classList.add('hidden');
                document.getElementById('marketplaceView').classList.remove('hidden');
                document.getElementById('pageTitle').textContent = 'B2B Carbon Marketplace';

                navLinks.forEach(l => l.classList.remove('active'));
                document.querySelector('[data-view="marketplace"]').classList.add('active');

                const sellModal = document.getElementById('sellModal');
                if (sellModal) {
                    sellModal.classList.remove('hidden');
                    document.getElementById('creditAmount').value = data.carbon_credits;
                    document.getElementById('creditLocation').value = `${data.latitude}, ${data.longitude}`;
                }
            };

            const certBtn = document.createElement('button');
            certBtn.className = 'btn-secondary';
            certBtn.style.flex = '1';
            certBtn.innerHTML = '<span>📜 View Certificate</span>';
            certBtn.onclick = () => showCertificate(data);

            btnContainer.appendChild(listBtn);
            btnContainer.appendChild(certBtn);
            resultsContainer.appendChild(btnContainer);
        }
    }

    function showCertificate(data) {
        const modal = document.getElementById('certificateModal');
        document.getElementById('certLocation').textContent = `(${data.latitude}, ${data.longitude})`;
        document.getElementById('certCover').textContent = `${data.green_cover_percentage}%`;
        document.getElementById('certCredits').textContent = `${data.carbon_credits} tCO2e`;
        document.getElementById('certHash').textContent = 'SHA-256:' + Math.random().toString(16).substring(2, 40);
        document.getElementById('certDate').textContent = new Date().toLocaleDateString();
        document.getElementById('certId').textContent = 'GV-' + Math.floor(Math.random() * 900000 + 100000);

        modal.classList.remove('hidden');
    }


    async function updateLedger() {
        try {
            const response = await fetch('/api/chain');
            const data = await response.json();

            ledgerFeed.innerHTML = '';

            // Reverse to show newest first
            [...data.chain].reverse().forEach(block => {
                const item = document.createElement('div');
                item.className = 'ledger-item';

                // Format nicely
                const hashShort = block.previous_hash.substring(0, 10) + '...';
                const time = block.timestamp;
                const dataCount = block.data.length;

                item.innerHTML = `
                    <span style="color: #555;">[${time}]</span> 
                    <strong>Block #${block.index}</strong> 
                    | PrevHash: ${hashShort} 
                    | Data: verification_data
                `;
                ledgerFeed.appendChild(item);
            });
        } catch (e) {
            console.error(e);
        }
    }

    // Initial load
    updateLedger();

    // === MODAL FUNCTIONALITY ===
    const navLinks = document.querySelectorAll('.nav-links li');
    const auditLogModal = document.getElementById('auditLogModal');
    const sentinelLogModal = document.getElementById('sentinelLogModal');
    const closeButtons = document.querySelectorAll('.close-modal');

    // Add click handlers to nav links
    navLinks.forEach((link, index) => {
        link.addEventListener('click', () => {
            const view = link.getAttribute('data-view');
            if (!view) return;

            // Remove active from all
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active to clicked
            link.classList.add('active');

            // Handle View Switching
            if (view === 'dashboard') {
                document.getElementById('dashboardView').classList.remove('hidden');
                document.getElementById('marketplaceView').classList.add('hidden');
                document.getElementById('pageTitle').textContent = 'Sentinel Dashboard';
            } else if (view === 'marketplace') {
                document.getElementById('dashboardView').classList.add('hidden');
                document.getElementById('marketplaceView').classList.remove('hidden');
                document.getElementById('pageTitle').textContent = 'B2B Carbon Marketplace';
                // Trigger marketplace refresh
                if (window.loadMarketplaceData) window.loadMarketplaceData();
            } else if (view === 'audit') {
                openAuditLog();
            } else if (view === 'sentinel') {
                openSentinelLog();
            } else if (view === 'settings') {
                document.getElementById('dashboardView').classList.add('hidden');
                document.getElementById('marketplaceView').classList.add('hidden');
                document.getElementById('settingsView').classList.remove('hidden');
                document.getElementById('pageTitle').textContent = 'System Settings';
            }
        });
    });

    // === SETTINGS TAB SWITCHING ===
    const settingsTabs = document.querySelectorAll('.settings-tabs li');
    const settingsContents = document.querySelectorAll('.settings-tab-content');

    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = `settings-${tab.getAttribute('data-tab')}`;

            // Update tabs
            settingsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update contents
            settingsContents.forEach(content => {
                content.classList.add('hidden');
                if (content.id === targetId) {
                    content.classList.remove('hidden');
                }
            });
        });
    });

    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const btn = saveSettingsBtn;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>⏳ Saving...</span>';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = '<span>✅ Saved Successfully</span>';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 2000);
            }, 1000);
        });
    }

    // Close modal handlers
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            document.getElementById(modalId).classList.add('hidden');
        });
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });

    async function openAuditLog() {
        auditLogModal.classList.remove('hidden');
        const container = document.getElementById('auditLogContent');
        container.innerHTML = '<div class="loading-spinner">Loading audit data...</div>';

        try {
            const response = await fetch('/api/audit-log');
            const data = await response.json();

            if (data.entries.length === 0) {
                container.innerHTML = '<div class="empty-state">No audit entries yet. Start verifying assets!</div>';
                return;
            }

            let html = `<div class="log-header">Total Entries: ${data.total_entries}</div>`;

            data.entries.reverse().forEach((entry, idx) => {
                const timestamp = new Date(entry.timestamp * 1000).toLocaleString();
                const statusClass = entry.status === 'VERIFIED' ? 'status-verified' : 'status-flagged';

                html += `
                    <div class="log-entry">
                        <div class="log-row">
                            <span class="log-label">Entry #${data.total_entries - idx}</span>
                            <span class="log-time">${timestamp}</span>
                        </div>
                        <div class="log-row">
                            <span class="log-label">Block:</span>
                            <span class="log-value">#${entry.block_index} | ${entry.block_hash}</span>
                        </div>
                        <div class="log-row">
                            <span class="log-label">Location:</span>
                            <span class="log-value">${entry.location}</span>
                        </div>
                        <div class="log-row">
                            <span class="log-label">Status:</span>
                            <span class="log-value ${statusClass}">${entry.status}</span>
                        </div>
                        <div class="log-row">
                            <span class="log-label">Carbon Credits:</span>
                            <span class="log-value highlight">${entry.carbon_credits} tCO2e</span>
                        </div>
                        <div class="log-row">
                            <span class="log-label">Green Cover:</span>
                            <span class="log-value">${entry.green_cover}%</span>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        } catch (error) {
            console.error(error);
            container.innerHTML = '<div class="error-state">Failed to load audit log</div>';
        }
    }

    async function openSentinelLog() {
        sentinelLogModal.classList.remove('hidden');
        const container = document.getElementById('sentinelLogContent');
        const statsContainer = document.getElementById('sentinelStats');
        container.innerHTML = '<div class="loading-spinner">Loading sentinel data...</div>';

        try {
            const response = await fetch('/api/sentinel-log');
            const data = await response.json();

            // Display stats
            statsContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Total Verifications</span>
                        <span class="stat-value">${data.total_verifications}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Sentinel Status</span>
                        <span class="stat-value status-verified">${data.sentinel_status}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">AI Model Version</span>
                        <span class="stat-value">${data.ai_model_version}</span>
                    </div>
                </div>
            `;

            if (data.logs.length === 0) {
                container.innerHTML = '<div class="empty-state">No verification logs yet. Start scanning!</div>';
                return;
            }

            let html = '';

            data.logs.reverse().forEach((log, idx) => {
                const timestamp = new Date(log.timestamp * 1000).toLocaleString();
                const statusClass = log.status === 'VERIFIED' ? 'status-verified' : 'status-flagged';

                html += `
                    <div class="log-entry">
                        <div class="log-row">
                            <span class="log-label">Scan #${data.total_verifications - idx}</span>
                            <span class="log-time">${timestamp}</span>
                        </div>
                        <div class="log-row">
                            <span class="log-label">Coordinates:</span>
                            <span class="log-value">(${log.latitude}, ${log.longitude})</span>
                        </div>
                        <div class="log-row">
                            <span class="log-label">Status:</span>
                            <span class="log-value ${statusClass}">${log.status}</span>
                        </div>
                        <div class="log-row">
                            <span class="log-label">AI Confidence:</span>
                            <span class="log-value">${log.ai_confidence}%</span>
                        </div>
                        <div class="log-row">
                            <span class="log-label">Green Cover:</span>
                            <span class="log-value">${log.green_cover_percentage}%</span>
                        </div>
                        <div class="log-row">
                            <span class="log-label">Carbon Credits:</span>
                            <span class="log-value highlight">${log.carbon_credits} tCO2e</span>
                        </div>
                        <div class="log-row">
                            <span class="log-label">Reasons:</span>
                            <span class="log-value">${log.reasons.join(' | ')}</span>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        } catch (error) {
            console.error(error);
            container.innerHTML = '<div class="error-state">Failed to load sentinel log</div>';
        }
    }

    // === DATA FEED SIMULATION ===
    const visualizer = document.getElementById('visualizer');
    function simulateDataFeed() {
        if (!visualizer) return;
        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.height = '1px';
        line.style.width = '100%';
        line.style.background = 'rgba(0, 255, 157, 0.1)';
        line.style.top = Math.random() * 100 + '%';
        line.style.left = '0';
        line.style.pointerEvents = 'none';
        visualizer.appendChild(line);

        setTimeout(() => line.remove(), 2000);
    }

    setInterval(simulateDataFeed, 500);
});
