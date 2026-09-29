const mongoose = require('mongoose');
const dns = require('dns');
const { mongoUri } = require('./env');

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
  } catch (err) {
    if (err.message && err.message.includes('querySrv ECONNREFUSED')) {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      await mongoose.connect(mongoUri);
    } else {
      throw err;
    }
  }
  console.log('MongoDB connected');
};

module.exports = connectDB;