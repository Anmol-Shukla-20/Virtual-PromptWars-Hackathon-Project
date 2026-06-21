document.addEventListener('DOMContentLoaded', () => {
    // Check Authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

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
    let userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const userObj = JSON.parse(userStr);
            const initial = userObj.fullName ? userObj.fullName.charAt(0).toUpperCase() : 'U';
            const avatarDiv = document.getElementById('userAvatarInitial');
            if (avatarDiv) {
                avatarDiv.innerHTML = initial;
                avatarDiv.classList.add('text-lg');
            }
            
            // Pre-fill Name if not set in profileData
            if (!localStorage.getItem('profileData')) {
                document.getElementById('profName').value = userObj.fullName || '';
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

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('aside');
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            sidebar.classList.toggle('absolute');
            sidebar.classList.toggle('z-50');
            sidebar.classList.toggle('h-full');
            sidebar.classList.toggle('w-64');
        });
    }

    // Profile Logic
    const profName = document.getElementById('profName');
    const profGender = document.getElementById('profGender');
    const profDob = document.getElementById('profDob');
    const profAge = document.getElementById('profAge');
    const profWeight = document.getElementById('profWeight');
    const profHeight = document.getElementById('profHeight');
    const profGoalCo2 = document.getElementById('profGoalCo2');
    const profGoalPts = document.getElementById('profGoalPts');
    const profileForm = document.getElementById('profileForm');
    const saveFeedback = document.getElementById('saveFeedback');

    // Load data from localStorage (acting as frontend state for profile)
    function loadProfile() {
        const dataStr = localStorage.getItem('profileData');
        if (dataStr) {
            try {
                const data = JSON.parse(dataStr);
                if (data.name) profName.value = data.name;
                if (data.gender) profGender.value = data.gender;
                if (data.dob) {
                    profDob.value = data.dob;
                    calculateAge(data.dob);
                }
                if (data.weight) profWeight.value = data.weight;
                if (data.height) profHeight.value = data.height;
                if (data.goalCo2) profGoalCo2.value = data.goalCo2;
                if (data.goalPts) profGoalPts.value = data.goalPts;
            } catch(e) {}
        }
    }

    // Calculate age automatically when DOB changes
    function calculateAge(dobString) {
        if (!dobString) {
            profAge.innerText = "--";
            return;
        }
        const today = new Date();
        const birthDate = new Date(dobString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        profAge.innerText = age >= 0 ? age + " yrs" : "--";
    }

    profDob.addEventListener('change', (e) => {
        calculateAge(e.target.value);
    });

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const profileData = {
            name: profName.value,
            gender: profGender.value,
            dob: profDob.value,
            weight: profWeight.value,
            height: profHeight.value,
            goalCo2: profGoalCo2.value,
            goalPts: profGoalPts.value
        };

        // Save to local storage
        localStorage.setItem('profileData', JSON.stringify(profileData));
        
        // Also update the core user object in local storage so the Avatar updates everywhere
        if (userStr && profileData.name) {
            try {
                let userObj = JSON.parse(userStr);
                userObj.fullName = profileData.name;
                localStorage.setItem('user', JSON.stringify(userObj));
                
                // Update avatar live on the current page
                const initial = userObj.fullName.charAt(0).toUpperCase();
                const avatarDiv = document.getElementById('userAvatarInitial');
                if (avatarDiv) avatarDiv.innerHTML = initial;
            } catch(e) {}
        }

        saveFeedback.classList.remove('opacity-0');
        setTimeout(() => {
            saveFeedback.classList.add('opacity-0');
        }, 3000);
    });

    loadProfile();
});
