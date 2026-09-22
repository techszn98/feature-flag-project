const mongoose = require('mongoose');
const { hashPassword } = require('../../utils/password');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
      required: [
        function () {
          return this.authProvider === 'local';
        },
        'Password is required',
      ],
    },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    role: { type: String, enum: ['Client', 'Admin'], default: 'Client' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await hashPassword(this.password);
});

module.exports = mongoose.model('User', userSchema);