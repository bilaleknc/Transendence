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
        console.log("selam")
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        registerToggle.classList.add('active');
        loginToggle.classList.remove('active');
    });
  
    // Giriş formu gönderim işlemi
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        console.log('Giriş yap:', username, password);
        // Giriş işlemi burada gerçekleştirilebilir
    });
  
    // Kayıt formu gönderim işlemi
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        console.log('Üye ol:', username, password);
        // Kayıt işlemi burada gerçekleştirilebilir
    });
  
    // 42 ile giriş işlemi
    fortyTwoLogin.addEventListener('click', function() {
      console.log('42 ile giriş yap');
    });
  
    // Google ile giriş işlemi
    googleLogin.addEventListener('click', function() {
      console.log('Google ile giriş yap');
    })
  });

  console.log("Signup")