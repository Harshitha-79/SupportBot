import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'robin@gmail.com' });
    if (!user) {
      console.log('User not found');
      return;
    }

    const hashedPassword = await bcrypt.hash('password123', 10);
    user.password = hashedPassword;
    await user.save();

    console.log('Password reset to password123 for robin@gmail.com');

    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

resetPassword();