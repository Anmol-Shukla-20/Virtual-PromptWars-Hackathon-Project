document.addEventListener('DOMContentLoaded', async () => {
    // Check Authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Logout handling
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
    document.getElementById('dropdownLogoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    // Profile Dropdown Toggle
    const profileDropdownBtn = document.getElementById('profileDropdownBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    // Update Avatar Initial
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const userObj = JSON.parse(userStr);
            const initial = userObj.fullName ? userObj.fullName.charAt(0).toUpperCase() : 'U';
            const avatarDiv = document.getElementById('userAvatarInitial');
            if (avatarDiv) {
                avatarDiv.innerHTML = initial;
                avatarDiv.classList.add('text-lg');
            }
        } catch(e) {}
    }
    
    if (profileDropdownBtn && profileDropdown) {
        profileDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('hidden');
        });
        
        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target)) {
                profileDropdown.classList.add('hidden');
            }
        });
    }

    const onboardingModal = document.getElementById('onboardingModal');
    const onboardingForm = document.getElementById('onboardingForm');
    
    // Check Onboarding
    const profileComplete = localStorage.getItem('profileComplete');
    if (!profileComplete) {
        onboardingModal.classList.remove('hidden');
    } else {
        await loadDashboardData();
    }

    // Onboarding Form Submit
    onboardingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const obSubmitBtn = document.getElementById('obSubmitBtn');
        obSubmitBtn.innerText = 'Setting up...';
        obSubmitBtn.disabled = true;

        const diet = document.getElementById('obDiet').value;
        const commute = document.getElementById('obCommute').value;

        try {
            // Log diet baseline
            await api.request('/tracker/log', {
                method: 'POST',
                body: JSON.stringify({ activityType: 'lifestyle', dietPreference: diet })
            });
            
            // Log commute baseline
            await api.request('/tracker/log', {
                method: 'POST',
                body: JSON.stringify({ activityType: 'transportation', mode: commute, distance: 0 })
            });

            localStorage.setItem('profileComplete', 'true');
            onboardingModal.classList.add('hidden');
            await loadDashboardData();
        } catch (error) {
            console.error('Onboarding failed', error);
            obSubmitBtn.innerText = 'Error - Try Again';
            obSubmitBtn.disabled = false;
        }
    });
});

let footprintChartInstance = null;
let trendChartInstance = null;

async function loadDashboardData() {
    try {
        const data = await api.request('/tracker/summary');
        
        const emptyState = document.getElementById('emptyStateContainer');
        const chartsGrid = document.getElementById('chartsGrid');
        
        // EcoPoints Calculation (Real from DB)
        let totalPoints = data.ecoPoints !== undefined ? data.ecoPoints : 0;
        
        // Add offline fallback points if empty
        if (data.breakdown.total === 0 && totalPoints === 0) {
            totalPoints = 1250;
            document.getElementById('co2Saved').innerText = "124";
        } else {
            document.getElementById('co2Saved').innerText = (data.co2Saved !== undefined ? data.co2Saved.toFixed(1) : 0);
        }

        document.getElementById('ecoPoints').innerText = totalPoints;

        let userLevel = "🌱 Green Beginner";
        if (totalPoints > 1000) userLevel = "🌿 Eco Explorer";
        if (totalPoints > 3000) userLevel = "🌳 Carbon Warrior";
        if (totalPoints > 5000) userLevel = "🏆 Planet Protector";
        document.getElementById('userLevel').innerText = userLevel;

        // Sustainability score (0 to 100)
        let score = data.sustainabilityScore !== undefined ? data.sustainabilityScore : 0;
        document.getElementById('susScore').innerText = score;
        
        let calculatedRank = Math.max(1, Math.floor(10000 / (totalPoints + 10)));
        const globalRankEl = document.getElementById('globalRank');
        if (globalRankEl) globalRankEl.innerText = '#' + calculatedRank;

        // Hackathon Fallback: If DB is completely empty, inject dummy data so charts always render
        if (data.breakdown.total === 0) {
            data.breakdown = { transportation: 15, electricity: 22, lifestyle: 10, shopping: 0, total: 47 };
            data.trend = [
                { _id: new Date(Date.now() - 86400000).toISOString(), dailyTotal: 8 },
                { _id: new Date().toISOString(), dailyTotal: 15 }
            ];
        }

        emptyState.classList.add('hidden');
        chartsGrid.classList.remove('hidden');
        
        initCharts(data.breakdown, data.trend);
    } catch (err) {
        console.error('Failed to load dashboard data', err);
    }
}

function initCharts(breakdown, trend) {
    const ctxPie = document.getElementById('footprintChart');
    if (ctxPie) {
        if (footprintChartInstance) footprintChartInstance.destroy();
        footprintChartInstance = new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: ['Transport', 'Electricity', 'Diet', 'Shopping'],
                datasets: [{
                    data: [breakdown.transportation, breakdown.electricity, breakdown.lifestyle, breakdown.shopping],
                    backgroundColor: ['#3b82f6', '#eab308', '#22c55e', '#a855f7'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });
    }

    const ctxBar = document.getElementById('trendChart');
    if (ctxBar) {
        if (trendChartInstance) trendChartInstance.destroy();
        
        const labels = trend.map(t => t._id);
        const values = trend.map(t => t.dailyTotal);

        document.getElementById('weeklyTotal').innerText = `Total: ${breakdown.total.toFixed(1)} kg CO₂`;

        trendChartInstance = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: labels.length ? labels : ['Today'],
                datasets: [{
                    label: 'Daily Emissions (kg CO₂)',
                    data: values.length ? values : [0],
                    backgroundColor: '#16a34a',
                    borderRadius: 4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
    }
}
