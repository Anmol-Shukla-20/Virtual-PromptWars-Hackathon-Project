document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = 'index.html';

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    const transportForm = document.getElementById('transportForm');
    const feedback = document.getElementById('logFeedback');

    const tabTransport = document.getElementById('tab-transport');
    const tabElectricity = document.getElementById('tab-electricity');
    const tabLifestyle = document.getElementById('tab-lifestyle');
    const tabShopping = document.getElementById('tab-shopping');

    const electricityForm = document.getElementById('electricityForm');
    const lifestyleForm = document.getElementById('lifestyleForm');
    const shoppingForm = document.getElementById('shoppingForm');

    // Tab Switching Logic
    const switchTab = (activeTab, activeForm) => {
        [tabTransport, tabElectricity, tabLifestyle, tabShopping].forEach(tab => {
            if(tab) tab.className = 'px-4 py-2 font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap';
        });
        if(activeTab) activeTab.className = 'px-4 py-2 font-medium text-green-600 border-b-2 border-green-600 whitespace-nowrap';

        [transportForm, electricityForm, lifestyleForm, shoppingForm].forEach(form => {
            if(form) form.classList.add('hidden');
        });
        if(activeForm) activeForm.classList.remove('hidden');
        if(feedback) feedback.classList.add('hidden'); // clear feedback on switch
    };

    if(tabTransport) tabTransport.addEventListener('click', () => switchTab(tabTransport, transportForm));
    if(tabElectricity) tabElectricity.addEventListener('click', () => switchTab(tabElectricity, electricityForm));
    if(tabLifestyle) tabLifestyle.addEventListener('click', () => switchTab(tabLifestyle, lifestyleForm));
    if(tabShopping) tabShopping.addEventListener('click', () => switchTab(tabShopping, shoppingForm));

    // Submit Logic helper
    const submitLog = async (data, form) => {
        try {
            const result = await api.request('/tracker/log', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            let extraHtml = '';
            if (result.co2Saved && result.co2Saved > 0) {
                extraHtml = `<div class="mt-2 text-green-700 font-bold">🌟 Fantastic! You chose a greener method and saved ${result.co2Saved.toFixed(2)} kg CO₂ compared to a car! <br>🎉 You earned <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs ml-1">+${result.earnedPoints} Bonus Points</span></div>`;
            }

            feedback.className = 'mt-4 p-4 rounded-xl text-sm font-medium bg-green-50 text-green-800 border border-green-200 block';
            feedback.innerHTML = `✅ Successfully logged! You emitted approximately <strong>${result.activity.carbonEmission.toFixed(2)} kg CO₂</strong>.${extraHtml}`;
            form.reset();
        } catch (error) {
            feedback.className = 'mt-4 p-4 rounded-xl text-sm font-medium bg-red-50 text-red-800 border border-red-200 block';
            feedback.innerText = '❌ Failed to log activity: ' + error.message;
        }
    };

    const transportModeSelect = document.getElementById('transportMode');
    const evCheckboxContainer = document.getElementById('evCheckboxContainer');
    
    if (transportModeSelect && evCheckboxContainer) {
        transportModeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'ev') {
                evCheckboxContainer.classList.remove('hidden');
            } else {
                evCheckboxContainer.classList.add('hidden');
                document.getElementById('evRenewable').checked = false;
            }
        });
    }

    transportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitLog({
            activityType: 'transportation',
            mode: document.getElementById('transportMode').value,
            distance: parseFloat(document.getElementById('transportDistance').value),
            isRenewableEV: document.getElementById('evRenewable').checked
        }, transportForm);
    });

    electricityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitLog({
            activityType: 'electricity',
            unitsConsumed: parseFloat(document.getElementById('electricityUnits').value)
        }, electricityForm);
    });

    lifestyleForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitLog({
            activityType: 'lifestyle',
            dietPreference: document.getElementById('dietPreference').value
        }, lifestyleForm);
    });

    shoppingForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitLog({
            activityType: 'shopping',
            shoppingFrequency: document.getElementById('shoppingFrequency').value
        }, shoppingForm);
    });
});
