document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginToggle = document.getElementById('login-toggle');
    const registerToggle = document.getElementById('register-toggle');
    const googleLogin = document.getElementById('google-login');
    const fortyTwoLogin = document.getElementById('42-login'); 
  
    // Formları geçiş yapma işlevi
    loginToggle.addEventListener('click', function() {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginToggle.classList.add('active');
        registerToggle.classList.remove('active');
    });
  
    registerToggle.addEventListener('click', function() {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        registerToggle.classList.add('active');
        loginToggle.classList.remove('active');
    });
  });