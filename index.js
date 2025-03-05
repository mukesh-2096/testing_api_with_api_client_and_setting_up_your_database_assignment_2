const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Helper function to read books from file
const readBooks = () => {
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

// Helper function to write books to file
const writeBooks = (books) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2));
};

// Create a new book
app.post('/books', (req, res) => {
    const books = readBooks();
    const { book_id, title, author, genre, year, copies } = req.body;
    
    if (!book_id || !title || !author || !genre || !year || !copies) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (books.find(book => book.book_id === book_id)) {
        return res.status(400).json({ error: 'Book ID already exists' });
    }

    const newBook = { book_id, title, author, genre, year, copies };
    books.push(newBook);
    writeBooks(books);
    res.status(201).json(newBook);
});

// Retrieve all books
app.get('/books', (req, res) => {
    const books = readBooks();
    res.json(books);
});

// Retrieve a specific book by ID
app.get('/books/:id', (req, res) => {
    const books = readBooks();
    const book = books.find(b => b.book_id === req.params.id);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
});

// Update book information
app.put('/books/:id', (req, res) => {
    const books = readBooks();
    const bookIndex = books.findIndex(b => b.book_id === req.params.id);
    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }
    
    const { title, author, genre, year, copies } = req.body;
    if (title) books[bookIndex].title = title;
    if (author) books[bookIndex].author = author;
    if (genre) books[bookIndex].genre = genre;
    if (year) books[bookIndex].year = year;
    if (copies) books[bookIndex].copies = copies;
    
    writeBooks(books);
    res.json(books[bookIndex]);
});

// Delete a book
app.delete('/books/:id', (req, res) => {
    const books = readBooks();
    const bookIndex = books.findIndex(b => b.book_id === req.params.id);
    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }
    books.splice(bookIndex, 1);
    writeBooks(books);
    res.json({ message: 'Book deleted successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on  http://localhost:${PORT}`);
});