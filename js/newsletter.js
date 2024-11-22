const nodemailer = require('nodemailer');
const juice = require('nodemailer-juice');

async function sendNewsletterConfirmation(mailOptions) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: 'himjrnl@gmail.com',
            pass: 'odka jbmr mtcz exvl'
        }
    });

    transporter.use('compile', juice({
        inlineExternal: true
    }));

    return transporter.sendMail(mailOptions);
}

module.exports = { sendNewsletterConfirmation };