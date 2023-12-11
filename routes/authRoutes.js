const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const Cart = require('../models/cart');
const Item = require('../models/item');

const router = express.Router();

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.send({ 'success': true, 'message': 'Already logged in.' });
    }
    next();
};
const isAdminMiddleware = (req, res, next) => {
    if (req.isAuthenticated() && req.session.user.isAdmin) {
        // If the user is authenticated and isAdmin is true, proceed to the next middleware
        return next();
    } else {
        // If not authenticated or not an admin, respond with unauthorized status
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};

const isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.send({ 'success': true, 'message': 'User not Logged in.' });
    }
    next();
};

router.post('/login', isLoggedIn, passport.authenticate('local'), function (req, res) {
    console.log(req.user)
    req.session.user = req.user;
    res.send({ success: true, message: 'Login Successful' });
});


router.get('/currentUser', async (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.status(401).send({ success: false, message: 'User not logged in' });
    }
    res.send({ success: "true", user: user })
});

// Registration route
router.post('/register', isLoggedIn, async (req, res) => {
    const usernamePattern = /^[a-zA-Z ]+$/;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^[0-9]+$/;

    if (!usernamePattern.test(req.body.username)) {
        return res.status(400).send({ success: false, message: 'Invalid username format. Use alphabet characters only (spaces allowed).' });
    }
    if (!emailPattern.test(req.body.email)) {
        return res.status(400).send({ success: false, message: 'Invalid email format.' });
    }
    if (!phonePattern.test(req.body.mobile)) {
        return res.status(400).send({ success: false, message: 'Invalid phone format. Use numbers only.' });
    }
    if (!req.body.password) {
        return res.status(400).send({ success: false, message: 'Password cannot be empty.' });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] }).exec();
        if (existingUser) {
            res.status(400).send({ success: false, message: 'User with the same username or email already exists.' });
        }
    }
    catch (err) {
        res.status(500).send({ success: false, message: err.message });
    }

    try {
        const { username, email, mobile, password } = req.body;

        User.register(new User({
            username: req.body.username, email: req.body.email,
            phone: req.body.phone,
            address: req.body.address
        }), req.body.password, function (err, user) {
            if (err) {
                // res.status(500).send({ success: false, message: 'An error occurred during registration.' });
            }
        });
        res.send({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error(error);
        // res.status(500).send({ success: false, message: 'An error occurred during registration.' });
    }
});

router.get('/logout', isNotLoggedIn, function (req, res) {
    req.logout(function (err) {
        if (err) {
            console.error("Error logging out: ", err);
        }
        req.session.destroy(function (err) {
            if (err) {
                console.error("Error destroying session: ", err);
            }
            res.send({ 'success': true, 'message': 'Logged out successfully.' });
        });
    }); // Clear the login session
});


// Import the item model

// Endpoint to get item data
router.get('/items', async (req, res) => {
    try {
        const { search, filter, minPrice, maxPrice, category,_id } = req.query;

        let query = {};

        // Apply search parameter
        if (search) {
            query.name = { $regex: new RegExp(search, 'i') };
        }
        if(_id)
        {
            query._id = _id;
        }
        // Apply filter parameter
        let sortOptions = {};
        if (filter === 'lowToHigh') {
            // Sort by price low to high
            sortOptions = { price: 1 };
        } else if (filter === 'highToLow') {
            // Sort by price high to low
            sortOptions = { price: -1 };
        }

        // Apply price range filter
        if (minPrice && maxPrice) {
            query.price = { $gte: minPrice, $lte: maxPrice };
        } else if (minPrice) {
            query.price = { $gte: minPrice };
        } else if (maxPrice) {
            query.price = { $lte: maxPrice };
        }

        // Apply category filter
        if (category) {
            query.category = category;
        }

        const items = await Item.find(query)
            .sort(sortOptions);
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching items');
    }
});

router.post('/add-item',isAdminMiddleware, async (req, res) => {
    try {
        const { name, description, price, imageUrl,quantity, category } = req.body;

        // Check if a item with the same name already exists
        const existingitem = await Item.findOne({ name });
        if (existingitem) {
            return res.status(400).send({ success: false, message: 'item name already exists' });
        }

        // Create a new item instance
        const newitem = new Item({ name, description, price, imageUrl,quantity, category });

        // Save the item to the database
        await newitem.save();

        res.status(201).send({ success: true, message: 'item added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error adding item' });
    }
});

// Update item by ID
router.put('/update-item/:itemId', isAdminMiddleware, async (req, res) => {
    try {
        const { name, description, price, imageUrl, quantity, category } = req.body;
        const itemId = req.params.itemId;

        // Check if the item exists
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).send({ success: false, message: 'Item not found' });
        }

        // Update item properties
        item.name = name;
        item.description = description;
        item.price = price;
        item.quantity = quantity;
        item.category = category;
        item.imageUrl = imageUrl;

        // Save the updated item
        await item.save();

        res.status(200).send({ success: true, message: 'Item updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error updating item' });
    }
});

// Delete item by ID
router.delete('/delete-item/:itemId', isAdminMiddleware, async (req, res) => {
    try {
        const itemId = req.params.itemId;
        console.log('delete item id-',itemId);
        await Item.deleteOne({ _id: itemId }).then(function(){
            console.log("Item deleted"); // Success
            res.status(200).send({ success: true, message: 'Item deleted successfully' });
        }).catch(function(error){
            console.log(error); // Failure
            throw new Error(error);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error deleting item' });
    }
});


router.post('/add-to-cart', async (req, res) => {
    try {
        // Get userId from session
        const userId = req.session.user._id;
        console.log(userId)

        if (!userId) {
            return res.status(401).send({ success: false, message: 'User not logged in' });
        }
        const { itemId } = req.body; // Using itemId passed from the frontend

        // Find the item in the database
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).send({ success: false, message: 'item not found' });
        }

        // Find or create the user's cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Check if the item already exists in the cart
        let itemIndex = cart.items.findIndex(item => item.itemId.equals(itemId));

        if (itemIndex > -1) {
            // item exists in the cart, update the quantity
            cart.items[itemIndex].quantity += 1;
        } else {
            // Add the new item to the cart
            cart.items.push({ itemId: item._id, quantity: 1 });
        }

        await cart.save();
        res.send({ success: true, message: 'item added to cart' });

    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error adding to cart' });
    }
});


router.get('/cart', async (req, res) => {
    try {
        const userId = req.session.user._id; // Assuming you're using sessions to track logged-in user
        if (!userId) {
            return res.status(401).send({ success: false, message: 'User not logged in' });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ userId }).populate('items.itemId');
        if (!cart) {
            return res.status(404).send({ success: false, message: 'Cart not found' });
        }

        // Transform the cart items to include necessary details
        const cartItems = cart.items.map(item => {
            if (item.itemId) {
            return {
                itemId: item.itemId._id,
                itemName: item.itemId.name,
                imageUrl: item.itemId.imageUrl,
                price: item.itemId.price,
                quantity: item.quantity,
                totalPrice: item.quantity * item.itemId.price
            };
        }});
        res.send({ success: true, cart: cartItems });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error fetching cart' });
    }
});

router.post('/checkout', async (req, res) => {
    const checkoutData = req.body;

    try {
        const userId = req.session.user._id;
        console.log(userId)

        if (!userId) {
            return res.status(401).send({ success: false, message: 'User not logged in' });
        }

        const uncheckedItems = [];

        for (const itemData of checkoutData) {
            const { itemId, quantity } = itemData;

            console.log(`item id ${itemId}`)
            // Assuming CartItem is your Mongoose model
            const cartItem = await Item.findOne({ _id : itemId });

            if (cartItem) {
                // Check if item quantity is less than cart quantity
                console.log(`cartitem quantity ${cartItem.quantity}`)
                if (cartItem.quantity < quantity) {
                    uncheckedItems.push({ name: cartItem.name, availableQuantity: cartItem.quantity });
                } else {
                    // Update the quantity in the database
                    cartItem.quantity -= quantity;
                    await cartItem.save();

                    let cart = await Cart.findOne({ userId });

                    cart.items = cart.items.filter(item => !item.itemId.equals(itemId));

                    await cart.save();
                }
            } else {
                // Handle the case where the item is not found in the cart
                console.error(`Item not found in cart: ${itemId}`);
            }
        }

        if (uncheckedItems.length > 0) {
            // Some items were not checked out due to insufficient quantity
            return res.json({
                success: false,
                message: 'Some items were not checked out due to insufficient quantity',
                uncheckedItems,
            });
        }
        // Clear the user's cart or perform any other necessary actions

        // Send a success response
        res.json({ success: true, message: 'Checkout successful' });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Function to update the database (Mongoose example)
async function updateDatabase(checkoutData) {


    return uncheckedItems;
}

module.exports = router;


module.exports = router;
