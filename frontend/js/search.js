document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Search Modal HTML into Body
    const searchModalHTML = `
        <div id="globalSearchModal" class="fixed inset-0 z-[100] hidden items-start justify-center pt-20 sm:pt-24 pb-4 px-4 bg-gray-900/50 backdrop-blur-sm transition-opacity opacity-0">
            <div id="searchModalContent" class="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-95 opacity-0">
                <!-- Search Input Header -->
                <div class="relative flex items-center px-4 border-b border-gray-100">
                    <svg class="w-6 h-6 text-gray-400 absolute left-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input type="text" id="globalSearchInput" class="w-full pl-12 pr-4 py-5 text-lg text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-400" placeholder="Search pages, activities, features..." autocomplete="off" spellcheck="false">
                    <button id="closeSearchModalBtn" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg focus:outline-none">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <!-- Search Results List -->
                <div class="max-h-96 overflow-y-auto p-2" id="searchResultsContainer">
                    <!-- Results injected here -->
                </div>
                
                <!-- Footer -->
                <div class="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t border-gray-100 flex justify-between">
                    <span>Use <kbd class="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-sans">↑</kbd> <kbd class="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-sans">↓</kbd> to navigate</span>
                    <span><kbd class="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-sans">Enter</kbd> to select</span>
                    <span><kbd class="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-sans">Esc</kbd> to close</span>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', searchModalHTML);

    const searchModal = document.getElementById('globalSearchModal');
    const searchModalContent = document.getElementById('searchModalContent');
    const searchInput = document.getElementById('globalSearchInput');
    const resultsContainer = document.getElementById('searchResultsContainer');
    const closeBtn = document.getElementById('closeSearchModalBtn');
    const searchButtons = document.querySelectorAll('.global-search-btn');

    // 2. Search Index Data
    const searchIndex = [
        { title: "Dashboard", description: "View your EcoPoints, emissions summary, and charts", url: "dashboard.html", icon: "📊" },
        { title: "Log Activity", description: "Log daily transportation, electricity, diet, and shopping", url: "log.html", icon: "📝" },
        { title: "Log Transportation", description: "Add car, metro, EV, or flight trips", url: "log.html", icon: "🚗" },
        { title: "Log Electricity", description: "Track your home energy consumption", url: "log.html", icon: "⚡" },
        { title: "Log Diet", description: "Update your dietary preferences for today", url: "log.html", icon: "🥗" },
        { title: "Scoreboard", description: "View global leaderboard and user rankings", url: "scoreboard.html", icon: "🏆" },
        { title: "EcoBot AI Coach", description: "Chat with AI for personalized sustainability tips", url: "chat.html", icon: "🤖" },
        { title: "My Profile", description: "Update your account details and goals", url: "profile.html", icon: "👤" }
    ];

    let currentSelectedIndex = -1;
    let currentResults = [];

    // 3. Modal Logic
    const openModal = () => {
        searchModal.classList.remove('hidden');
        searchModal.classList.add('flex');
        
        // Trigger animations
        requestAnimationFrame(() => {
            searchModal.classList.remove('opacity-0');
            searchModalContent.classList.remove('scale-95', 'opacity-0');
        });

        searchInput.value = '';
        renderResults('');
        searchInput.focus();
    };

    const closeModal = () => {
        searchModal.classList.add('opacity-0');
        searchModalContent.classList.add('scale-95', 'opacity-0');
        
        setTimeout(() => {
            searchModal.classList.add('hidden');
            searchModal.classList.remove('flex');
        }, 200); // Wait for transition
    };

    // 4. Rendering Logic
    const renderResults = (query) => {
        const q = query.toLowerCase().trim();
        
        if (!q) {
            // Show top defaults when empty
            currentResults = searchIndex.slice(0, 5);
        } else {
            currentResults = searchIndex.filter(item => 
                item.title.toLowerCase().includes(q) || 
                item.description.toLowerCase().includes(q)
            );
        }

        resultsContainer.innerHTML = '';
        currentSelectedIndex = currentResults.length > 0 ? 0 : -1;

        if (currentResults.length === 0) {
            resultsContainer.innerHTML = `
                <div class="px-6 py-8 text-center text-gray-500">
                    <p>No matching features found for "${query}"</p>
                </div>
            `;
            return;
        }

        currentResults.forEach((item, index) => {
            const el = document.createElement('a');
            el.href = item.url;
            el.className = `flex items-center p-4 rounded-xl cursor-pointer transition-colors ${index === currentSelectedIndex ? 'bg-green-50 border-l-4 border-green-500' : 'hover:bg-gray-50 border-l-4 border-transparent'}`;
            el.id = `search-result-${index}`;
            el.innerHTML = `
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-xl mr-4">
                    ${item.icon}
                </div>
                <div>
                    <h4 class="text-sm font-semibold ${index === currentSelectedIndex ? 'text-green-800' : 'text-gray-900'}">${item.title}</h4>
                    <p class="text-xs text-gray-500 mt-0.5">${item.description}</p>
                </div>
            `;
            
            el.addEventListener('mouseenter', () => {
                updateSelection(index);
            });

            resultsContainer.appendChild(el);
        });
    };

    const updateSelection = (index) => {
        const previous = document.getElementById(`search-result-${currentSelectedIndex}`);
        if (previous) {
            previous.classList.remove('bg-green-50', 'border-green-500');
            previous.classList.add('hover:bg-gray-50', 'border-transparent');
            previous.querySelector('h4').classList.remove('text-green-800');
            previous.querySelector('h4').classList.add('text-gray-900');
        }

        currentSelectedIndex = index;

        const current = document.getElementById(`search-result-${currentSelectedIndex}`);
        if (current) {
            current.classList.remove('hover:bg-gray-50', 'border-transparent');
            current.classList.add('bg-green-50', 'border-green-500');
            current.querySelector('h4').classList.remove('text-gray-900');
            current.querySelector('h4').classList.add('text-green-800');
            current.scrollIntoView({ block: 'nearest' });
        }
    };

    // 5. Event Listeners
    searchButtons.forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    closeBtn.addEventListener('click', closeModal);
    
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) closeModal(); // Click outside content
    });

    searchInput.addEventListener('input', (e) => {
        renderResults(e.target.value);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentSelectedIndex < currentResults.length - 1) {
                updateSelection(currentSelectedIndex + 1);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentSelectedIndex > 0) {
                updateSelection(currentSelectedIndex - 1);
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentSelectedIndex >= 0 && currentResults[currentSelectedIndex]) {
                window.location.href = currentResults[currentSelectedIndex].url;
            }
        }
    });

    // Global shortcut to open search (Ctrl+K or Cmd+K)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openModal();
        } else if (e.key === 'Escape') {
            closeModal();
        }
    });
});
