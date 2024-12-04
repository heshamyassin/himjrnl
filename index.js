const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { sendNewsletterConfirmation } = require('./api/newsletter');

dotenv.config({ 
    path: './.env',
    encoding: 'utf8',
    debug: true
});

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
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

// Redirect root URL to index.html automatically
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
  
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})

module.exports = app;