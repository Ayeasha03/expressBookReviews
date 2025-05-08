const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const SECRET_KEY = "yourSecretKey"; // Change this to a strong secret in production

// Function to check if username exists
const isValid = (username) => {
    return users.some(user => user.username === username);
}

// Function to authenticate a user
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
}

// Middleware to verify JWT tokens
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ message: "Access token required" });

    jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });

        req.user = decoded.username;
        next();
    });
};

// Login route - Generates JWT token
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.json({ message: "Login successful!", accessToken });
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", verifyToken, (req, res) => {
    const { review } = req.body;
    const { isbn } = req.params;
    const username = req.user;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    if (!review) {
        return res.status(400).json({ message: "Review content is required." });
    }

    books[isbn].reviews = books[isbn].reviews || {};
    
    if (books[isbn].reviews[username]) {
        books[isbn].reviews[username] = review;
        return res.json({ message: "Review updated successfully!" });
    } else {
        books[isbn].reviews[username] = review;
        return res.json({ message: "Review added successfully!" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", verifyToken, (req, res) => {
    const { isbn } = req.params;
    const username = req.user;

    if (!books[isbn] || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found or unauthorized to delete." });
    }

    delete books[isbn].reviews[username];

    return res.json({ message: "Review deleted successfully!" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
