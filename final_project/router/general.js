const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists." });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "Registration successful!" });
});

// Get the book list using Async/Await
public_users.get("/", async (req, res) => {
  try {
      res.json(books); // Directly return the books stored locally
  } catch (error) {
      res.status(500).json({ message: "Error fetching book list", error });
  }
});

// Get book details by ISBN using Promises
public_users.get("/isbn/:isbn", (req, res) => {
    const { isbn } = req.params;

    axios.get(`http://localhost:5000/booksdb/${isbn}`)
        .then(response => res.json(response.data))
        .catch(error => res.status(500).json({ message: "Error fetching book details", error }));
});

// Get books by Author using Async/Await
public_users.get("/author/:author", async (req, res) => {
    try {
        const { author } = req.params;
        const response = await axios.get("http://localhost:5000/booksdb");
        const booksByAuthor = Object.values(response.data).filter(book => book.author === author);
        
        booksByAuthor.length 
            ? res.json(booksByAuthor) 
            : res.status(404).json({ message: "No books found by this author" });
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by author", error });
    }
});

// Get books by Title using Promises
public_users.get("/title/:title", (req, res) => {
    const { title } = req.params;

    axios.get("http://localhost:5000/booksdb")
        .then(response => {
            const booksByTitle = Object.values(response.data).filter(book => book.title === title);
            
            booksByTitle.length 
                ? res.json(booksByTitle) 
                : res.status(404).json({ message: "No books found with this title" });
        })
        .catch(error => res.status(500).json({ message: "Error fetching books by title", error }));
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const { isbn } = req.params;
    
    return books[isbn] && books[isbn].reviews
        ? res.status(200).json(books[isbn].reviews)
        : res.status(404).json({ message: "No reviews found for this book." });
});

module.exports.general = public_users;
