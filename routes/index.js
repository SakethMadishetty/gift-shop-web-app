// index.js
const express = require('express');
const app = express.Router();
const passport = require('passport');
const Account = require('../models/account');

app.use(express.urlencoded({ extended: true }));

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
};

const isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
};

app.get('/', function (req, res) {
    res.render('home', { user: req.session.user });
});

app.get('/register', isLoggedIn, function (req, res) {
    res.render('register', { error: null });
});

app.post('/register', isLoggedIn, async function (req, res) {
    const usernamePattern = /^[a-zA-Z ]+$/;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^[0-9]+$/;
    const addressPattern = /^[a-zA-Z0-9 ,\-]+$/;

    if (!usernamePattern.test(req.body.username)) {
        return res.render('register', { error: 'Invalid username format. Use alphabet characters only (spaces allowed).' });
    }
    if (!emailPattern.test(req.body.email)) {
        return res.render('register', { error: 'Invalid email format.' });
    }
    if (!phonePattern.test(req.body.phone)) {
        return res.render('register', { error: 'Invalid phone format. Use numbers only.' });
    }
    if (!addressPattern.test(req.body.address)) {
        return res.render('register', { error: 'Invalid address format. No special characters allowed (spaces, commas, hyphen allowed).' });
    }
    if (!req.body.password) {
        return res.render('register', { error: 'Password cannot be empty.' });
    }

    try {
        const existingUser = await Account.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] }).exec();

        if (existingUser) {
            return res.render('register', { error: 'User with the same username or email already exists.' });
        }
    }
    catch (err) {
        res.render('register', { error: err.message });
    }
    console.log("register post");
    Account.register(new Account({
        username: req.body.username, email: req.body.email,
        phone: req.body.phone,
        address: req.body.address
    }), req.body.password, function (err, account) {
        if (err) {
            return res.render('register', { account: account });
        }

        passport.authenticate('local')(req, res, function () {
            req.session.user = req.body.username;
            console.log("success!");
            res.redirect('/login');
        });
    });
});


app.post('/login', isLoggedIn, passport.authenticate('local'), function (req, res) {
    req.session.user = req.user.username;
    res.redirect('/');
});

app.get('/logout', isNotLoggedIn, function (req, res) {
    req.logout(function (err) {
        if (err) {
            console.error("Error logging out: ", err);
        }
        req.session.destroy(function (err) {
            if (err) {
                console.error("Error destroying session: ", err);
            }
            res.redirect('/');
        });
    });
});

app.get('/login', isLoggedIn, function (req, res) {
    res.render('login');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});


module.exports = app;
