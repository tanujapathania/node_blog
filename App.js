const express = require('express');
const app = express();
const PORT = 3000;

// Set view engine to EJS
app.set('view engine', 'ejs');

// Blog data
const blogs = [
  {
    title: 'First Blog Post',
    author: 'John Doe',
    content: 'This is the content of the first blog post.',
  },
  {
    title: 'Second Blog Post',
    author: 'Jane Doe',
    content: 'This is the content of the second blog post.',
  },
];

// Home route
app.get('/', (req, res) => {
  res.render('index', { blogs: blogs });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
