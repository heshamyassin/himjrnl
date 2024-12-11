const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { sendNewsletterConfirmation } = require('./api/newsletter');

const secretKey = '1234';
const jwtSecret = '000-000-000';
const allowedOrigin = 'http://localhost:3000/';

dotenv.config({ 
   /* path: './.env', */
    encoding: 'utf8',
    debug: true
});

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/sendNewsletterConfirmationMail', async (req, res) => {
    const { to, subject, html } = req.body;

    const mailOptions = {
        "from": "TheHiM <himjrnl@gmail.com>",
        to,
        subject,
        html
    };

    try {
        await sendNewsletterConfirmation(mailOptions);
        res.status(200).send('Success');
    } catch (error) {
        res.status(500).send('Failure');
    }
});

app.get('/getConfig', (req, res) => {
    res.json(process.env);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


/* HYASSIN: TO DO - Replace getConfig ********/
function verifyJWT(req, res, next) {
    /* const token = req.headers['authorization']?.split(' ')[1]; */
    const token = req.cookies.token;
    const origin = req.headers['origin'] || req.headers['referer'];
    console.log(req.cookies);
    if (!token) return res.status(403).send('Forbidden: No token provided');
  
    if (origin === allowedOrigin) {
        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) return res.status(403).send('Forbidden: Invalid token');
            req.user = decoded;
            next();
        });
    }

    res.status(403).send('Forbidden: Invalid request source');
}

app.get('/api/generate-token', (req, res) => {
    const origin = req.headers['origin'] || req.headers['referer'];
  
    if (origin === allowedOrigin) {
        const token = jwt.sign({ user: 'client' }, jwtSecret, { expiresIn: '1m' });
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 60000
        });

        res.json({success: true, message: 'Token generated successfully'});
    }
    
    res.status(403).send('Forbidden: Invalid request source');
});

app.get('/api/secret', verifyJWT, (req, res) => {
    res.json({ secret_key: secretKey });
});
/*********/
  
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})

module.exports = (req, res) => {
    app(req, res);
};