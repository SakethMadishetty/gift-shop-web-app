document.getElementById('add-item-form').addEventListener('submit', function(e) {
    e.preventDefault();

    var name = document.getElementById('name').value;
    var description = document.getElementById('description').value;
    var price = document.getElementById('price').value;
    var quantity = document.getElementById('quantity').value
    var category = document.getElementById('category').value
    var imageUrl = document.getElementById('imageUrl').value;

    fetch('/add-item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, price, imageUrl,quantity,category }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('item added successfully!');
            // Optionally, clear the form or redirect
            window.location.href = '/dashboard.html';
        } else {
            alert(data.message);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    });
});
