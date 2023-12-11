document.addEventListener('DOMContentLoaded', function () {
    // Get itemId from the URL
    var itemId = getParameterByName('itemId');

    // Fetch item details based on itemId
    fetch(`/items?_id=${itemId}`) // Replace with the actual endpoint to get item details
        .then(response => response.json())
        .then(data => {
            if (data) {
                // Populate form fields with the retrieved data
                document.getElementById('name').value = data[0].name;
                document.getElementById('description').value = data[0].description;
                document.getElementById('price').value = data[0].price;
                document.getElementById('quantity').value = data[0].quantity;
                document.getElementById('category').value = data[0].category;
                document.getElementById('imageUrl').value = data[0].imageUrl;
            } else {
                alert('Error fetching item details. Please try again.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        });
});

document.getElementById('update-item-form').addEventListener('submit', function (e) {
    e.preventDefault();

    var name = document.getElementById('name').value;
    var description = document.getElementById('description').value;
    var price = document.getElementById('price').value;
    var quantity = document.getElementById('quantity').value
    var category = document.getElementById('category').value
    var imageUrl = document.getElementById('imageUrl').value;
    var itemId = getParameterByName('itemId');
    console.log('itemId', itemId)

    fetch(`/update-item/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, price, imageUrl, quantity, category }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('item updated successfully!');
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

// Function to parse URL parameters
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    const regex = /\?([^]+)/;
    // Use the regex to extract the ID
    const match = url.match(regex);

    // Check if there's a match and get the ID (if present)
    const id = match ? match[1] : null;
    return id;
}