const nodemailer = require('nodemailer');
const nodemailerJuice = require('nodemailer-juice');

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
    
    transporter.use('compile', nodemailerJuice());

    try {
        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email: ", error);
    }
}

module.exports = { sendNewsletterConfirmation };