const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if user already exists
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists." });
  }

  // Register the new user
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

// Task 10: Get the book list using Async/Await
public_users.get("/", async (req, res) => {
  try {
    res.json(books); // Directly return the books stored locally
  } catch (error) {
    res.status(500).json({ message: "Error fetching book list", error });
  }
});

// Task 11: Get book details by ISBN using Async/Await and Promises
public_users.get('/isbn/:isbn', async (req, res) => {
  const { isbn } = req.params;

  const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      book ? resolve(book) : reject("Book not found");
    });
  };

  try {
    const book = await getBookByISBN(isbn);
    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Task 12: Get book details by author using Async/Await and Promises
public_users.get('/author/:author', async (req, res) => {
  const { author } = req.params;

  const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
      const matched = Object.values(books).filter(book =>
        book.author.toLowerCase().includes(author.toLowerCase())
      );
      matched.length > 0 ? resolve(matched) : reject("No books found for this author");
    });
  };

  try {
    const result = await getBooksByAuthor(author);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Task 13: Get books by Title using Async/Await and Promises
public_users.get("/title/:title", async (req, res) => {
  const { title } = req.params;

  const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
      const found = Object.values(books).filter(book =>
        book.title.toLowerCase() === title.toLowerCase()
      );
      found.length > 0 ? resolve(found) : reject("No books found with this title");
    });
  };

  try {
    const booksFound = await getBooksByTitle(title);
    res.status(200).json(booksFound);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;

  return books[isbn] && books[isbn].reviews
    ? res.status(200).json(books[isbn].reviews)
    : res.status(404).json({ message: "No reviews found for this book." });
});

module.exports.general = public_users;
