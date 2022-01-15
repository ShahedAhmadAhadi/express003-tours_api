const nodemailer = require('nodemailer');

// module.exports = class Email {
//     constructor(user, url) {
//         this.to = user.email;
//         this.firstName = user.name.split(' ')
//         this.url = url;
//         this.from = `Jonas Schmedtmann ${process.env.EMAIL_FROM}`
//     }

//     createTransport() {
//         if(process.env.NODE_ENV = 'production') {
//             return 1
//         }
//         return nodemailer.createTransport({
//             host: process.env.EMAIL_HOST,
//             port: process.env.EMAIL_PORT,
//             auth: {
//                 user: process.env.EMAIL_USERNAME,
//                 pass: process.env.EMAIL_PASSWORD
//             }
//         });
//     }

//     send(template, subject) {

//     }

//     sendWelcome

// }

const sendEmail = async options => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: 'Jonas Schmedtmann <hello@jonas.io>',
        to: options.email,
        subject: options.subject,
        text: options.message
        // html:
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;