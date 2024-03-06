const express = require('express');
const Gun = require('gun');
require('gun/sea'); // This is necessary to use SEA
require('dotenv').config();
const jwt = require('jsonwebtoken');


const app = express();
const port = 3000;

app.use(Gun.serve);
app.use(express.json()); // For parsing application/json

const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

const gun = Gun({ file: 'data', web: server, peers: ["http://34.228.165.192:8765/gun"] });

// User Registration
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    gun.user().create(username, password, (ack) => {
        if (ack.err) {
            // User creation failed
            console.error(ack.err);
            res.status(500).send(ack.err);
        } else {
            // User created successfully
            console.log("User created:", ack);
            res.status(201).send('User created successfully');
        }
    });
});

// User Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    gun.user().auth(username, password, (ack) => {
        if (ack.err) {
            // Authentication failed
            console.error(ack.err);
            res.status(401).send('Invalid credentials');
        } else {
            // User authenticated successfully, issue JWT
            const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '24h' });
            console.log("=============",token)
            return token
        }
    });
});

// Create or Update Data
app.post('/data', verifyToken, (req, res) => {
    const { key, value } = req.body;    
    const user = gun.user();
    if (user.is) {
        user.get(key).put(value, ack => {
            if(ack.err) {
                console.error('Failed to save:', ack.err);
                res.status(500).send('Failed to save data');
            } else {
                res.status(200).send('Data saved successfully');
            }
        });
    } else {
        // If not authenticated with GunDB, or session not found
        res.status(401).send('GunDB user session not active. Please login again.');
    }
});


app.get('/getData', verifyToken, (req, res) => {
    const { key } = req.query;
    const user = gun.user();
    if (user.is) {
        user.get(key).once((data) => {
            if (data && data !== null) {
                res.status(200).json({ success: true, data });
            } else {
                res.status(404).send({ success: false, message: "Data not found" });
            }
        });
    } else {
        res.status(401).send('User session not active. Please login again.');
    }
});


// Delete Data
app.delete('/data', (req, res) => {
    const { username, password, key } = req.body;

    // Authenticate before proceeding
    gun.user().auth(username, password, (ack) => {
        if (ack.err) {
            res.status(401).send('Authentication failed');
        } else {
            // Authenticated user, proceed to delete data
            const user = gun.user();
            user.get(key).put(null, ack => {
                if (ack.err) {
                    console.error('Failed to delete:', ack.err);
                    res.status(500).send('Failed to delete data');
                } else {
                    res.status(200).send('Data deleted successfully');
                }
            });
        }
    });
});


function verifyToken(req, res, next) {
    const bearerHeader = req.headers['token'];
    if (typeof bearerHeader !== 'undefined') {
        jwt.verify(bearerHeader, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                console.log(err)
                res.sendStatus(403); 
            } else {
                req.authData = authData;
                next();
            }
        });
    } else {
        res.sendStatus(401); 
    }
}