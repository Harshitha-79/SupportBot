import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import jwt from 'jsonwebtoken';

let mongod;
let server;
let request;

test('setup and confirm ticket flow', async (t) => {
  // start in-memory mongo
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // create users
  const emp = await User.create({ name: 'Emp', email: 'emp@example.com', password: 'pass', role: 'employee' });
  const it = await User.create({ name: 'IT', email: 'it@example.com', password: 'pass', role: 'it_support' });

  // sign tokens
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
  const empToken = jwt.sign({ id: emp._id.toString() }, process.env.JWT_SECRET);
  const itToken = jwt.sign({ id: it._id.toString() }, process.env.JWT_SECRET);

  request = supertest(app);

  // employee creates a ticket
  const createRes = await request.post('/api/tickets').set('Authorization', `Bearer ${empToken}`).send({ title: 'Help', description: 'Need help' });
  assert.equal(createRes.status, 201);
  const ticketId = createRes.body._id;

  // employee confirms
  const empConfirm = await request.post(`/api/tickets/${ticketId}/confirm`).set('Authorization', `Bearer ${empToken}`).send();
  assert.equal(empConfirm.status, 200);
  assert.equal(empConfirm.body.resolvedByUser, true);
  assert.equal(empConfirm.body.resolvedByIT, false);
  assert.notEqual(empConfirm.body.status, 'resolved');

  // it confirms
  const itConfirm = await request.post(`/api/tickets/${ticketId}/confirm`).set('Authorization', `Bearer ${itToken}`).send();
  assert.equal(itConfirm.status, 200);
  assert.equal(itConfirm.body.resolvedByUser, true);
  assert.equal(itConfirm.body.resolvedByIT, true);
  assert.equal(itConfirm.body.status, 'resolved');

  // cleanup
  await mongoose.disconnect();
  await mongod.stop();
});
