document.addEventListener('DOMContentLoaded', () => {
    // Check Authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    const travelForm = document.getElementById('travelForm');
    travelForm.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateRoutes();
    });
});

const EMISSION_FACTORS = {
    car: 0.192,
    bike: 0.103,
    bus: 0.089,
    metro: 0.041,
    walking: 0,
    cycling: 0
};

const MODE_DETAILS = {
    car: { icon: '🚗', name: 'Car', speedKmh: 40, costPerKm: 10 },
    bike: { icon: '🏍️', name: 'Motorbike', speedKmh: 35, costPerKm: 4 },
    bus: { icon: '🚌', name: 'Bus', speedKmh: 25, costPerKm: 2 },
    metro: { icon: '🚇', name: 'Metro', speedKmh: 45, costPerKm: 3 },
    cycling: { icon: '🚲', name: 'Cycling', speedKmh: 15, costPerKm: 0 },
    walking: { icon: '🚶', name: 'Walking', speedKmh: 5, costPerKm: 0 }
};

function calculateRoutes() {
    const distanceInput = document.getElementById('distance').value;
    const distance = parseFloat(distanceInput);
    if (!distance || distance <= 0) return;

    const options = Object.keys(EMISSION_FACTORS).map(mode => {
        const details = MODE_DETAILS[mode];
        const emission = distance * EMISSION_FACTORS[mode];
        const timeHours = distance / details.speedKmh;
        const timeMins = Math.round(timeHours * 60);
        const cost = distance * details.costPerKm;

        return {
            mode,
            name: details.name,
            icon: details.icon,
            emission: emission.toFixed(2),
            timeMins,
            cost: cost.toFixed(2)
        };
    });

    // Find highlights
    const greenest = [...options].sort((a, b) => parseFloat(a.emission) - parseFloat(b.emission))[0];
    const fastest = [...options].sort((a, b) => a.timeMins - b.timeMins)[0];
    const cheapest = [...options].sort((a, b) => parseFloat(a.cost) - parseFloat(b.cost))[0];

    renderOptions(options, { greenest, fastest, cheapest });
}

function renderOptions(options, highlights) {
    const container = document.getElementById('optionsContainer');
    const resultsSection = document.getElementById('resultsSection');
    
    container.innerHTML = '';

    options.forEach(opt => {
        let badges = '';
        if (opt.mode === highlights.greenest.mode) badges += `<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium ml-2">🌱 Greenest</span>`;
        if (opt.mode === highlights.fastest.mode) badges += `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium ml-2">⚡ Fastest</span>`;
        if (opt.mode === highlights.cheapest.mode) badges += `<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium ml-2">💰 Cheapest</span>`;

        const card = document.createElement('div');
        card.className = 'bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4';
        
        card.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="text-4xl">${opt.icon}</div>
                <div>
                    <div class="flex items-center">
                        <h4 class="font-bold text-gray-900 text-lg">${opt.name}</h4>
                        ${badges}
                    </div>
                    <div class="text-sm text-gray-500 mt-1">
                        ⏱️ ${formatTime(opt.timeMins)} • 💵 ₹${opt.cost}
                    </div>
                </div>
            </div>
            <div class="text-right">
                <div class="text-sm text-gray-500 mb-1">Carbon Footprint</div>
                <div class="text-xl font-bold ${parseFloat(opt.emission) === 0 ? 'text-green-600' : 'text-gray-900'}">
                    ${opt.emission} <span class="text-sm font-medium text-gray-500">kg CO₂</span>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    resultsSection.classList.remove('hidden');
}

function formatTime(mins) {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
}
