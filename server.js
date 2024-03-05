const Gun = require('gun');
const express = require('express');

const app = express();
const port = 3000;

// Middleware
app.use(express.json()); // for parsing application/json

// Initialize Gun
// Initialize Gun with remote peer
const gun = Gun({
    peers: ['http://34.228.165.192:8765/gun'] // Add your remote peer URL here
  });
  

  
// CRUD operations
app.post('/data', (req, res) => {
  const { key, value } = req.body;
  gun.get(key).put(value);
  res.send({ message: 'Data saved', key, value });
});

app.get('/data/:key', (req, res) => {
  const key = req.params.key;
  gun.get(key).once(data => {
    res.send(data);
  });
});

app.put('/data', (req, res) => {
  const { key, value } = req.body;
  gun.get(key).put(value);
  res.send({ message: 'Data updated', key, value });
});

app.delete('/data/:key', (req, res) => {
  const key = req.params.key;
  gun.get(key).put(null); // This effectively deletes the data
  res.send({ message: 'Data deleted', key });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
