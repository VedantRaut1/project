const nodemailer = require('nodemailer');
require('dotenv').config(); 

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: "vedantraut0407@gmail.com",
        pass: "ljqbszkbegdkbfbr"
    }
});

module.exports = transporter;
