document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = 'index.html';

    // Logout handling
    const logout = () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    };
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('dropdownLogoutBtn')?.addEventListener('click', logout);

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
            if (!profileDropdown.contains(e.target)) profileDropdown.classList.add('hidden');
        });
    }

    // Badge Download Logic
    window.downloadBadge = function(badgeId, filename) {
        const badgeElement = document.getElementById(badgeId);
        if (!badgeElement) return;
        
        html2canvas(badgeElement, {
            backgroundColor: null,
            scale: 2 // High resolution
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = filename + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    };

    renderDynamicLeaderboard();
});

async function renderDynamicLeaderboard() {
    let myPoints = 0;
    let myCo2 = 0;
    let myLevel = "🌱 Green Beginner";
    let allActivities = [];

    try {
        const data = await api.request('/tracker/summary');
        try {
            allActivities = await api.request('/tracker/activities');
        } catch(e) {
            console.warn("Failed to fetch activities detail");
        }
        
        myPoints = data.ecoPoints !== undefined ? data.ecoPoints : 0;
        myCo2 = data.co2Saved !== undefined ? data.co2Saved : 0;
        
        if (myPoints > 1000) myLevel = "🌿 Eco Explorer";
        if (myPoints > 3000) myLevel = "🌳 Carbon Warrior";
        if (myPoints > 5000) myLevel = "🏆 Planet Protector";

        // Render Weekly Points Breakdown
        const weeklyContainer = document.getElementById('weeklyPointsContainer');
        if (weeklyContainer) {
            document.getElementById('totalWeeklyPoints').innerText = myPoints;
            
            if (data.trend.length > 0) {
                weeklyContainer.innerHTML = '';
                let maxPoints = 0;
                const dailyPointsArr = data.trend.map(day => {
                    const p = 50 + Math.floor(day.dailyTotal * 2);
                    if (p > maxPoints) maxPoints = p;
                    return { date: day._id, pts: p };
                });

                dailyPointsArr.forEach(day => {
                    const heightPercent = Math.max(10, (day.pts / maxPoints) * 100);
                    // Use UTC date strictly to avoid timezone shifts
                    const dayName = new Date(day.date + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
                    
                    weeklyContainer.innerHTML += `
                        <div onclick="showActivitiesForDay('${day.date}', ${day.pts}, '${dayName}')" class="flex flex-col items-center w-full max-w-[40px] group cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors">
                            <span class="text-xs font-bold text-green-700 mb-1">${day.pts}</span>
                            <div class="w-full bg-green-200 rounded-t-md relative group-hover:bg-green-400 transition-colors" style="height: ${heightPercent}%;"></div>
                            <span class="text-xs font-medium text-gray-500 mt-2">${dayName}</span>
                        </div>
                    `;
                });
                
                // Expose function globally so inline onclick works
                window.showActivitiesForDay = (dateStr, pts, dayName) => {
                    const detailsContainer = document.getElementById('dailyActivityDetails');
                    const activityList = document.getElementById('activityList');
                    document.getElementById('selectedDayTitle').innerText = `Activities for ${dayName}, ${dateStr}`;
                    document.getElementById('selectedDayPoints').innerText = `${pts} pts`;
                    
                    detailsContainer.classList.remove('hidden');
                    activityList.innerHTML = '';
                    
                    const dayActivities = allActivities.filter(a => {
                        return a.date && a.date.startsWith(dateStr);
                    });
                    
                    if(dayActivities.length === 0) {
                        activityList.innerHTML = `<div class="text-sm text-gray-500 italic py-2">No detailed activity logs found for this day. Baseline points awarded.</div>`;
                        return;
                    }
                    
                    dayActivities.forEach(act => {
                        let icon = '📝';
                        let desc = act.activityType;
                        
                        if(act.activityType === 'transportation') {
                            icon = '🚴';
                            desc = `${act.mode} (${act.distance} km)`;
                        } else if(act.activityType === 'electricity') {
                            icon = '⚡';
                            desc = `${act.unitsConsumed} kWh used`;
                        } else if(act.activityType === 'lifestyle') {
                            icon = '🥗';
                            desc = `${act.dietPreference} Diet`;
                        } else if(act.activityType === 'shopping') {
                            icon = '🛍️';
                            desc = `${act.shoppingFrequency} Frequency`;
                        }
                        
                        const earned = act.carbonEmission === 0 ? '<span class="text-green-600 text-xs font-bold">+ Points</span>' : '';
                        
                        activityList.innerHTML += `
                            <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 text-sm">${icon}</div>
                                <div class="flex-1">
                                    <div class="text-sm font-medium text-gray-800 capitalize">${act.activityType}</div>
                                    <div class="text-xs text-gray-500 capitalize">${desc}</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-xs text-gray-400">${new Date(act.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    ${earned}
                                </div>
                            </div>
                        `;
                    });
                };
            } else {
                weeklyContainer.innerHTML = `<p class="text-sm text-gray-400 w-full text-center pb-8">No data to display yet.</p>`;
            }
        }
    } catch (e) {
        console.error('Failed to get score data', e);
    }

    const unrankedBanner = document.getElementById('unrankedBanner');
    if (unrankedBanner && myPoints === 0) {
        unrankedBanner.classList.remove('hidden');
    }

    const userStr = localStorage.getItem('user');
    let myName = "You";
    if (userStr) {
        try {
            myName = JSON.parse(userStr).fullName || "You";
        } catch(e){}
    }

    let allUsers = [
        { name: "Sarah Jenkins", level: "🏆 Planet Protector", co2: 845, points: 5200 },
        { name: "Rahul Sharma", level: "🌳 Carbon Warrior", co2: 620, points: 4100 },
        { name: "Emily Chen", level: "🌳 Carbon Warrior", co2: 590, points: 3850 },
        { name: "Michael Doe", level: "🌱 Green Beginner", co2: 45, points: 300 },
        { name: myName, level: myLevel, co2: myCo2, points: myPoints, isMe: true }
    ];

    allUsers.sort((a, b) => b.points - a.points);

    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';

    allUsers.forEach((user, index) => {
        const isMe = user.isMe;
        let rank = index + 1;
        let rankBadge = `<span class="font-bold text-gray-500">#${rank}</span>`;
        
        if (isMe && myPoints === 0) {
            rankBadge = `<span class="text-xs font-bold text-gray-400">Unranked</span>`;
        } else {
            if (rank === 1) rankBadge = `<span class="text-2xl">🥇</span>`;
            if (rank === 2) rankBadge = `<span class="text-2xl">🥈</span>`;
            if (rank === 3) rankBadge = `<span class="text-2xl">🥉</span>`;
        }

        const tr = document.createElement('tr');
        tr.className = `border-b border-gray-100 hover:bg-gray-50 transition-colors ${isMe ? 'bg-green-50/50' : ''}`;
        
        tr.innerHTML = `
            <td class="p-4 text-center">${rankBadge}</td>
            <td class="p-4 font-medium ${isMe ? 'text-green-700 font-bold' : 'text-gray-800'}">
                ${user.name}
            </td>
            <td class="p-4 text-center text-sm">
                <span class="px-3 py-1 bg-gray-100 rounded-full text-gray-700">${user.level}</span>
            </td>
            <td class="p-4 text-right font-medium text-gray-700">${user.co2} kg</td>
            <td class="p-4 text-right font-bold text-yellow-600">${user.points}</td>
        `;
        tbody.appendChild(tr);
    });
}
