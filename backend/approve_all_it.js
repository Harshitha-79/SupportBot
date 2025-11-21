import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

async function approveAllIT() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await User.updateMany(
      { role: 'it_support', isApproved: false },
      { isApproved: true, approvedAt: new Date() }
    );
    console.log('Approval result:', result);
    console.log('✅ All pending IT staff accounts have been approved');

    // Show all IT staff now
    const allIT = await User.find({ role: 'it_support' }).select('name email isApproved');
    console.log('\nAll IT Staff:');
    allIT.forEach(u => console.log(`- ${u.name}: ${u.email} (approved: ${u.isApproved})`));

    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

approveAllIT();