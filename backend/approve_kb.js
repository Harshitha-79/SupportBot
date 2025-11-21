import mongoose from 'mongoose';
import dotenv from 'dotenv';
import KbDocument from './src/models/KbDocument.js';

dotenv.config();

async function approveAllKB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await KbDocument.updateMany(
      { approved: false },
      { approved: true, approvedAt: new Date() }
    );
    console.log('Approval result:', result);
    console.log('✅ All pending KB documents have been approved');

    // Show all KB docs now
    const allKB = await KbDocument.find({}).select('title approved');
    console.log('\nAll KB Documents:');
    allKB.forEach(d => console.log(`- ${d.title}: approved: ${d.approved}`));

    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

approveAllKB();