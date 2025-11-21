import connectDB from "../config/db.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

const argv = process.argv.slice(2);
const applyChanges = argv.includes("--apply");

const findLeastLoadedIT = async () => {
  const itUsers = await User.find({ role: "it_support" }).select("_id");
  if (itUsers.length === 0) return null;

  let best = null;
  for (const u of itUsers) {
    const count = await Ticket.countDocuments({ assignedTo: u._id, status: { $in: ["open", "in_progress"] } });
    if (!best || count < best.count) best = { userId: u._id, count };
  }
  return best?.userId || null;
};

const run = async () => {
  await connectDB();

  // Find tickets that were marked resolved by employee but have no assigned IT and no IT confirmation
  const query = {
    assignedTo: { $in: [null, undefined] },
    resolvedByUser: true,
    $or: [
      { resolvedByIT: { $in: [false, null] } },
      { resolvedByITId: { $in: [null, undefined] } }
    ]
  };

  const tickets = await Ticket.find(query);
  console.log(`Found ${tickets.length} ticket(s) that were employee-resolved but unassigned.`);

  if (tickets.length === 0) {
    process.exit(0);
  }

  for (const t of tickets) {
    console.log(`- ${t._id} | ${t.title} | createdBy: ${t.createdBy} | status: ${t.status}`);
  }

  if (!applyChanges) {
    console.log('\nDry run: no changes made. Re-run with --apply to assign and reopen tickets.');
    process.exit(0);
  }

  // apply changes: assign to least-loaded IT and reopen (in_progress)
  const assignTo = await findLeastLoadedIT();
  if (!assignTo) {
    console.error('No IT support users found to assign tickets to. Aborting.');
    process.exit(1);
  }

  for (const t of tickets) {
    t.assignedTo = assignTo;
    t.resolvedByIT = false;
    t.resolvedByITId = null;
    t.resolvedByITAt = null;
    // If ticket was marked resolved solely because employee confirmed, reopen it
    if (t.status === 'resolved') t.status = 'in_progress';
    await t.save();
    console.log(`Updated ${t._id}: assigned to ${assignTo} and reopened.`);
  }

  console.log('\nDone.');
  process.exit(0);
};

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
