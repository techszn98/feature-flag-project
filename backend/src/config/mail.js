const nodemailer = require('nodemailer');
const { email } = require('./env');

const transporter = nodemailer.createTransport({
  host: email.host,
  port: email.port,
  secure: email.secure,
  auth: {
    user: email.user,
    pass: email.password,
  },
});

module.exports = transporter;
