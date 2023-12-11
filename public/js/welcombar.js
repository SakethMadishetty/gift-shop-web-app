document.addEventListener('DOMContentLoaded', function () {
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', function () {
        fetch('/logout', {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            // console.log(data)
            if (data.success) {
                // Redirect to the login page or perform any other action
                window.location.href = '/index.html';
            } else {
                alert('Failed to logout.');
            }
        })
        .catch(error => console.error('Error:', error));
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('item1-container');
    fetch('/currentUser')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(user => {
            // console.log(user)
            const welcome = document.getElementById('welcome-message');
            welcome.innerHTML = "Welcome, " + user.user.username;
        })
        .catch(error => {
            // container.removeChild(loadingMessage); // Remove loading message
            window.location.href = '/index.html';
            console.error('Error:', error);
        });
});

document.getElementById('cart').addEventListener('click', function () {
    window.location.href = '/checkout.html';
});
