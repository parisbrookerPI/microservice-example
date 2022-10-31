import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order, OrderStatus } from "../../models/Order";
import { Ticket } from "../../models/Ticket";

const buildTicket = async (title: string, price: number) => {
  const ticket = Ticket.build({
    title,
    price,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  return ticket;
};

it("returns the specific order given the ID", async () => {
  //Create ticket

  const user = global.signin();

  const ticketOne = await buildTicket("metalica", 555);
  //request to build order with ticket

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // fetch ticket based on order ID

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(fetchedOrder.id == order.id);
});

it("returns 401 if  not the smae user", async () => {
  //Create ticket

  const user = global.signin();

  const ticketOne = await buildTicket("metalica", 555);
  //request to build order with ticket

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // fetch ticket based on order ID

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(401);
});
