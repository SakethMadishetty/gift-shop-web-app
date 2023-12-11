document.addEventListener('DOMContentLoaded', function () {
    fetch('/cart')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.cart) {
                // Call displayCart function with the cart data
                displayCart(data.cart);
            } else {
                alert(data.message);
                window.location.href = '/dashboard.html';
            }
        })
        .catch(error => console.error('Error:', error));
});

function handleCheckout(cartItems) {
    return function () {
        // Extract item details for the POST request
        const checkoutData = cartItems.map(item => {
            if (item) {
                return {
                    itemId: item.itemId,
                    quantity: item.quantity,
                    totalPrice: item.totalPrice
                    // Add more properties as needed
                };
            }
        });
        const checkoutDataNew = checkoutData.filter(value => value !== null && value !== undefined);

        console.log('checkout data',checkoutDataNew)
        // Make a POST request to the '/checkout' endpoint
        fetch('/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any additional headers as needed
            },
            body: JSON.stringify(checkoutDataNew),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.uncheckedItems && data.uncheckedItems.length > 0) {
                    // Display unchecked items on checkout.html
                    alert('Some items were not checked out due to insufficient quantity.');
                } else {
                    // Checkout successful, show a success message (you can customize this)
                    alert('Checkout successful!');
                    // Redirect to the dashboard or any other desired page
                    window.location.href = '/dashboard.html';
                }
            })
            .catch(error => {
                // Handle errors during the fetch
                console.error('Error during checkout:', error);
            });
    };
}

function displayCart(cartItems) {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = '';
    const cartItemsNew = cartItems.filter(value => value !== null && value !== undefined);
    if (cartItemsNew.length === 0) {
        // Display a message when no items are found for the query
        const noItemsMessage = document.createElement('p');
        noItemsMessage.textContent = 'Cart is Empty.';
        cartContainer.appendChild(noItemsMessage);
    }
    console.log('cart item', cartItemsNew);

    cartItemsNew.forEach(item => {
        if (!item) {
            return;
        }
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        if (item.imageUrl) {
            const image = document.createElement('img');
            image.src = item.imageUrl;
            image.alt = item.itemName;
            itemElement.appendChild(image);
        }

        const textElement = document.createElement('div');
        textElement.className = 'cart-item-text';
        textElement.innerText = `${item.itemName} - Quantity: ${item.quantity} - Total Price: $${item.totalPrice}`;
        itemElement.appendChild(textElement);

        cartContainer.appendChild(itemElement);
    });

    const checkoutButton = document.createElement('button');
    checkoutButton.className = cartItemsNew.length === 0 ? 'empty-checkout-button' : 'checkout-button';
    checkoutButton.innerText = 'Checkout';
    checkoutButton.addEventListener('click', handleCheckout(cartItemsNew));
    cartContainer.appendChild(checkoutButton);
}
