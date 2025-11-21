import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";

dotenv.config();

async function main() {
  try {
    await connectDB();

    const passwordHash = await bcrypt.hash("password123", 10);

  // Upsert users (employee, IT support, admin, demo pending IT)
  const [emp1, it1, it2, admin, pendingIt] = await Promise.all([
      User.findOneAndUpdate(
        { email: "john.employee@organization.com" },
        { name: "John Employee", email: "john.employee@organization.com", password: passwordHash, role: "employee" },
        { new: true, upsert: true }
      ),
      User.findOneAndUpdate(
        { email: "hamshicr@gmail.com" },
        { name: "Hamshi C R", email: "hamshicr@gmail.com", password: passwordHash, role: "it_support" },
        { new: true, upsert: true }
      ),
      User.findOneAndUpdate(
        { email: "crhamshi@gmail.com" },
        { name: "CR Hamshi", email: "crhamshi@gmail.com", password: passwordHash, role: "it_support" },
        { new: true, upsert: true }
      ),
      User.findOneAndUpdate(
        { email: "admin@organization.com" },
        { name: "Administrator", email: "admin@organization.com", password: passwordHash, role: "admin" },
        { new: true, upsert: true }
      ),
    ]);

    // Clean existing demo tickets for this employee
    await Ticket.deleteMany({ createdBy: emp1._id });

    // Create demo tickets and spread across it_support users
    const ticketsData = [
      { title: "Laptop running slow", description: "My laptop is extremely slow after update.", assignedTo: it1._id },
      { title: "VPN connection issue", description: "Unable to connect to VPN from home network.", assignedTo: it2._id },
      { title: "Printer not responding", description: "Office printer near desk 12 doesn't respond.", assignedTo: it1._id },
      { title: "Email sync problem", description: "Outlook not syncing new emails.", assignedTo: it2._id },
    ];

    await Ticket.insertMany(
      ticketsData.map((t) => ({ ...t, createdBy: emp1._id, status: "open" }))
    );

  console.log("✅ Seed complete:\n- employee1@example.com / password123\n- it1@example.com / password123\n- it2@example.com / password123\n- admin@example.com / password123\n- hamshicr@gmail.com / hamshi (pending approval)");
  } catch (e) {
    console.error("Seed error:", e);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

main();


