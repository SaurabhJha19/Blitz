// server.js
const express = require('express');
const app = express();
const PORT = 5000;

// Middleware (to parse JSON)
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello, Node.js backend server is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
