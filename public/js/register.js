document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();

    var username = document.getElementById('username').value;
    var email = document.getElementById('email').value;
    var mobile = document.getElementById('mobile').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirm-password').value;

    // Check if passwords match
    if (password !== confirmPassword) {
        document.getElementById('error-message').innerText = 'Passwords do not match.';
        return;
    }

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, mobile, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Registration successful!');
            window.location.href = '/index.html'; // Redirect to login page
        } else {
            document.getElementById('error-message').innerText = data.message || 'Registration failed. Please try again.';
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById('error-message').innerText = 'An error occurred during registration. Please try again later.';
    });
});

function checkPasswordStrength(password) {
    // Define password strength criteria
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    const mediumRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})");

    // Check the password against criteria
    if (strongRegex.test(password)) {
        showPasswordStrength('Strong', 'strong');
    } else if (mediumRegex.test(password)) {
        showPasswordStrength('Medium', 'medium');
    } else {
        showPasswordStrength('Weak', 'weak');
    }
}

function showPasswordStrength(message, strengthClass) {
    const passwordStrengthElement = document.getElementById('password-strength');
    passwordStrengthElement.textContent = `Password Strength: ${message}`;
    passwordStrengthElement.className = strengthClass;
}