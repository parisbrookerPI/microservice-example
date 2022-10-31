import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order, OrderStatus } from "../../models/Order";
import { Ticket } from "../../models/Ticket";
import { natsWrapper } from "../../NatsWrapper";

it("has a route handler listening to /api/orders for post requests", async () => {
  const response = await request(app).post("/api/orders").send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed if user is signed in", async () => {
  await request(app).post("/api/orders").send({}).expect(401);
});

it("returns non-401 if user is signed in", async () => {
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it("returns error if ticket does not exist", async () => {
  const ticketId = new mongoose.Types.ObjectId();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId })
    .expect(404);
});

it("returns error if ticket is already reserved", async () => {
  //create ticket, save
  const ticket = Ticket.build({
    price: 20,
    title: "Concert",
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  //create order, save

  const order = Order.build({
    ticket,
    userId: "4343434",
    status: OrderStatus.Complete,
    expiresAt: new Date(), // Doesn't matter right now, relying on the order status. Expiration service will set the flag
  });

  await order.save();

  //try to reserve

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  //create ticket, save
  const ticket = Ticket.build({
    price: 20,
    title: "Concert",
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  //create order, save

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id });

  expect(response.status).toEqual(201);
});

it("emits an order created event", async () => {
  //create ticket, save
  const ticket = Ticket.build({
    price: 20,
    title: "Concert",
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  //create order, save
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
