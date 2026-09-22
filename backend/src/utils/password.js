const bcrypt = require('bcryptjs');

const hashPassword = (plainPassword) => bcrypt.hash(plainPassword, 10);

const comparePassword = (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword);

module.exports = { hashPassword, comparePassword };