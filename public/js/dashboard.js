document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('item1-container');
    const searchFilterDiv = document.getElementById('search-filter');
    let isAdmin = false;
    fetch('/currentUser')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(user => {
            // console.log(user)
            const welcome = document.getElementById('welcome-message')
            welcome.innerHTML = "Welcome, " + user.user.username
            isAdmin = user.user.isAdmin
            // Check if the user is an admin
            if (user.user.isAdmin) {
                // Create a button to add a new item

                const addButton = document.getElementById('add-item-btn');
                addButton.innerText = 'Add Item';
                addButton.addEventListener('click', function () {
                    // Redirect to the page for adding a new item
                    window.location.href = '/add-item.html';
                });
            }
        })
        .catch(error => {
            // container.removeChild(loadingMessage); // Remove loading message
            window.location.href = '/index.html';
            console.error('Error:', error);
        });

    fetch('/items')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(items => {
            updateItemsUI(items, isAdmin)
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

function addToCart(itemId) {
    fetch('/add-to-cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Added to cart!');
            } else {
                alert('Failed to add to cart.');
            }
        })
        .catch(error => console.error('Error:', error));
}
document.getElementById('cart').addEventListener('click', function () {
    fetch('/cart')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayCart(data.cart);
            } else {
                alert(data.message);
                window.location.href = '/dashboard.html';
            }
        })
        .catch(error => console.error('Error:', error));
});

function displayCart(cartItems) {
    let cartContent = cartItems.map(item =>
        `${item.productName} - Quantity: ${item.quantity}`).join('\n');
    alert('Cart Items:\n' + cartContent);
}
document.getElementById('cart').addEventListener('click', function () {
    window.location.href = '/checkout.html';
});


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
    const searchFilterBtn = document.getElementById('search-filter-btn');

    searchFilterBtn.addEventListener('click', function () {
        const searchInput = document.getElementById('search-input').value;
        const filterDropdown = document.getElementById('filter-dropdown');
        const minPriceInput = document.getElementById('min-price').value;
        const maxPriceInput = document.getElementById('max-price').value;
        const categoryDropdown = document.getElementById('category-dropdown');

        const selectedFilter = filterDropdown.options[filterDropdown.selectedIndex].value;
        const selectedCategory = categoryDropdown.options[categoryDropdown.selectedIndex].value;
        let isAdmin = false;
        fetch('/currentUser')
            .then(response => response.json())
            .then(user => {
                isAdmin = user.user.isAdmin
            }).catch(error => {
                console.error('Error fetching current user', error);
            });
        // Make a fetch request with search, filter, and category parameters
        fetch(`/items?search=${searchInput}&filter=${selectedFilter}&minPrice=${minPriceInput}&maxPrice=${maxPriceInput}&category=${selectedCategory}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(items => {
                // Handle the fetched items (e.g., update the UI)
                updateItemsUI(items, isAdmin);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
});

function updateItemsUI(items, isAdmin) {
    const container = document.getElementById('item1-container');
    container.innerHTML = '';
    if (items.length === 0) {
        // Display a message when no items are found for the query
        const noItemsMessage = document.createElement('h1');
        noItemsMessage.textContent = 'No items found for your query.';
        noItemsMessage.style = 'margin-top : 50px;'
        container.appendChild(noItemsMessage);
    } else {
        // Create a Bootstrap row for each set of three items
        items.forEach(item => {
            const column = document.createElement('div');
            column.className = 'col-md-3 mb-3';

            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
                    <img src="${item.imageUrl}" alt="${item.name}" class="card-img-top">
                    <div class="card-body">
                        <h5 class="card-title">${item.name}</h3>
                        <h6 class="card-subtitle mb-2 text-muted">${item.category}</h3>
                        <p class="card-text">${item.description}</p>
                        <p class="card-text">Price: $${item.price}</p>
                        <p class="card-text" style="color: red;">${item.quantity} pieces left!</p>
                        ` ;
            if (item.quantity > 0 && isAdmin === true) {
                card.innerHTML += `<div class="item-buttons">
                <button class="btn btn-outline-secondary add-to-cart" data-toggle="tooltip" data-placement="top" title="Add to Cart" data-item-id="${item._id}"><i class="fas fa-cart-plus"></i> + </button>
                <button class="btn btn-outline-primary update-item" data-toggle="tooltip" data-placement="top" title="Update Item" data-item-id="${item._id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-outline-danger delete-item" data-toggle="tooltip" data-placement="top" title="Delete Item" data-item-id="${item._id}"><i class="fas fa-trash-alt"></i></button>
                </div>`
            } else if ((item.quantity > 0 && isAdmin === false)) {
                card.innerHTML += `<div class="item-buttons"><button class="btn btn-outline-secondary add-to-cart" data-toggle="tooltip" data-placement="top" title="Add to Cart" data-item-id="${item._id}"><i class="fas fa-cart-plus"></i> + </button></div>
                `
            }
            else if ((item.quantity <= 0 && isAdmin === true)) {
                card.innerHTML += `<div class="item-buttons"><button class="btn btn-outline-secondary add-to-cart" data-toggle="tooltip" data-placement="top" title="Add to Cart" data-item-id="${item._id}" style="background-color: #ccc; color: #666; cursor: not-allowed;" disabled><i class="fas fa-cart-plus"></i> + </button>
                <button class="btn btn-outline-primary update-item" data-toggle="tooltip" data-placement="top" title="Update Item" data-item-id="${item._id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-outline-danger delete-item" data-toggle="tooltip" data-placement="top" title="Delete Item" data-item-id="${item._id}"><i class="fas fa-trash-alt"></i></button>
                </div>
                `
            }
            else {
                card.innerHTML += `<div class="item-buttons"><button class="btn btn-outline-secondary add-to-cart" data-toggle="tooltip" data-placement="top" title="Add to Cart" data-item-id="${item._id}" style="background-color: #ccc; color: #666; cursor: not-allowed;" disabled><i class="fas fa-cart-plus"></i> + </button></div>
                `
            }
           
            card.innerHTML += `</div>`; // Close the card-body div
            column.appendChild(card);
            container.appendChild(column);
        });

        // Add event listeners for the "Add to Cart" buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function () {
                const itemId = this.getAttribute('data-item-id');
                addToCart(itemId);
            });
        });

        // Add event listeners for the "Add to Cart" buttons
        document.querySelectorAll('.update-item').forEach(button => {
            button.addEventListener('click', function () {
                const itemId = this.getAttribute('data-item-id');
                window.location.href = `/update-item.html?${itemId}`
            });
        });
        // Add event listeners for the "Add to Cart" buttons
        document.querySelectorAll('.delete-item').forEach(button => {
            button.addEventListener('click', function () {
                const itemId = this.getAttribute('data-item-id');
                deleteItem(itemId);
            });
        });
    }
}

function deleteItem(itemId) {
    // Make a fetch request to delete the item
    fetch(`/delete-item/${itemId}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Reload the items after successful deletion
                let isAdmin = false;
                fetch('/currentUser')
                    .then(response => response.json())
                    .then(user => {
                        isAdmin = user.user.isAdmin
                    }).catch(error => {
                        console.error('Error fetching current user', error);
                    });

                fetch('/items')
                    .then(response => response.json())
                    .then(items => {
                        updateItemsUI(items, isAdmin);
                    })
                    .catch(error => {
                        console.error('Error fetching items after deletion:', error);
                    });
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error deleting item:', error));
}

function clearFilters() {
    // Clear input values and reset sliders to default values
    document.getElementById('search-input').value = '';
    document.getElementById('filter-dropdown').selectedIndex = 0;
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';
    document.getElementById('category-dropdown').selectedIndex = 0;
    
    // Add logic to reset sliders if you are using sliders
    // For example, if you are using jQuery UI sliders
    // $("#min-price").slider("value", 0);
    // $("#max-price").slider("value", 1000);
}