document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    const signupForm = document.getElementById('signupForm');
    const showSignupBtn = document.getElementById('showSignupBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const toggleToSignup = document.getElementById('toggleToSignup');
    const toggleToLogin = document.getElementById('toggleToLogin');

    // Toggle logic
    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            toggleToSignup.classList.add('hidden');
            signupForm.classList.remove('hidden');
            toggleToLogin.classList.remove('hidden');
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.classList.add('hidden');
            toggleToLogin.classList.add('hidden');
            loginForm.classList.remove('hidden');
            toggleToSignup.classList.remove('hidden');
        });
    }

    // Real Google Auth Logic
    window.handleGoogleCredential = async (response) => {
        const decoded = jwt_decode(response.credential);
        
        // If Signup Form is visible, process as Signup
        if (!signupForm.classList.contains('hidden')) {
            document.getElementById('signupName').value = decoded.name;
            document.getElementById('signupEmail').value = decoded.email;
            document.getElementById('signupPassword').focus();
            alert("Google profile fetched! Please type a password to complete your account creation.");
        } 
        // If Login Form is visible, process as Login
        else {
            try {
                const data = await api.googleLogin(decoded.email);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } catch(e) {
                alert("User not found please create an Acount first");
            }
        }
    };

    const initGoogleAuth = () => {
        if (typeof google !== 'undefined') {
            google.accounts.id.initialize({
                client_id: "511630275287-fms5c70d8jq4iddfut5rlcev80cchgl7.apps.googleusercontent.com",
                callback: handleGoogleCredential
            });
            
            const loginContainer = document.getElementById('googleLoginBtnContainer');
            if (loginContainer) {
                google.accounts.id.renderButton(loginContainer, { theme: "outline", size: "large", width: 400 });
            }
            
            const signupContainer = document.getElementById('googleSignupBtnContainer');
            if (signupContainer) {
                google.accounts.id.renderButton(signupContainer, { theme: "outline", size: "large", width: 400 });
            }
        } else {
            setTimeout(initGoogleAuth, 100);
        }
    };
    initGoogleAuth();

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const data = await api.login(email, password);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } catch (error) {
                alert('Login failed: ' + error.message);
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            
            try {
                const data = await api.register(fullName, email, password);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                alert('Account has been Created successfully!');
                window.location.href = 'dashboard.html';
            } catch (error) {
                alert('Sign up failed: ' + error.message);
            }
        });
    }
});
