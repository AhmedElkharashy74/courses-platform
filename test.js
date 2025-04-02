const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
app.use(cookieParser());

// Set up your GitHub credentials
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23lirGBVUAr9YP6AXW';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_SECRET || 'f7ccfcf081d2c09b29a70cf7f32917082e7f657f';
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

let refreshTokens = [];

// GitHub OAuth Strategy - Get Authentication URL
function getGitHubAuthURL() {
    return `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=user:email`;
}

// Exchange code for user data
async function getGitHubUserData(code) {
    // Step 1: Exchange the code for an access token
    const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: GITHUB_REDIRECT_URI,
        },
        { headers: { Accept: 'application/json' } }
    );
    const accessToken = tokenResponse.data.access_token;

    // Step 2: Fetch user data using the access token
    const userResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('User data response:', userResponse.data);

    return {
        id: userResponse.data.id,
        name: userResponse.data.login,
        avatar_url: userResponse.data.avatar_url,
        // email: userResponse.data.email,
    };
}

// Generate JWT token
function generateAccessToken(user) {
    return jwt.sign(user, JWT_SECRET, { expiresIn: '15m' });
}

// Generate refresh token
function generateRefreshToken(user) {
    const refreshToken = jwt.sign(user, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    refreshTokens.push(refreshToken); // Store the refresh token
    return refreshToken;
}

// Route to initiate GitHub OAuth login
app.get('/auth/github', (req, res) => {
    res.redirect(getGitHubAuthURL());
});

// Callback route to handle GitHub redirect with the code
app.get('/auth/github/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send('Missing code');
    }
    console.log('Received code:', code);
    try {
        const user = await getGitHubUserData(code);
        console.log('User data:', user);

        // Generate access and refresh tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);
        // Set the refresh token in a cookie
        // Send the tokens back as response (or store them in a cookie)
        // res.json({ accessToken, refreshToken, user });
        res.send(`<h1>Access Token: ${accessToken}</h1><h1>Refresh Token: ${refreshToken}</h1><h1>User: ${JSON.stringify(user)}</h1><img src="${user.avatar_url}" alt="User Avatar" style="width: 100px; height: 100px; border-radius: 50%;"/>`);
    } catch (error) {
        console.log('Error fetching user data:', error);
        res.status(500).send(error);
    }
});

// Refresh access token route
app.post('/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken || !refreshTokens.includes(refreshToken)) {
        return res.status(403).send('Invalid refresh token');
    }

    try {
        const user = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const newAccessToken = generateAccessToken(user);
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).send('Invalid refresh token');
    }
});

// Start server
app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
