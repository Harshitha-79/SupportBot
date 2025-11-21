import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config();

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'robin@gmail.com' });
    if (!user) {
      console.log('User not found');
      return;
    }
    console.log('User found:', user.name, user.email, user.role, 'approved:', user.isApproved);

    const isMatch = await bcrypt.compare('password123', user.password);
    console.log('Password match:', isMatch);

    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testLogin();