document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {

            window.location.href = '/dashboard.html';

            // Here, you can redirect the user to another page or perform other actions upon successful login
        } else {
            // Displaying the error message if login fails
            document.getElementById('error-message').innerText = 'Login failed. Please check your username and password.';
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById('error-message').innerText = 'Login failed. Please check your username and password.';
    });
});
