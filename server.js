const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const { sendNewsletterConfirmation } = require('./js/newsletter');
const port = process.env.PORT || 3000;


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.get('/', function(req, res) {
    res.sendfile(path.join(__dirname, 'index.html'));
});

app.post('/send-email', async (req, res) => {
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

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/`)
})