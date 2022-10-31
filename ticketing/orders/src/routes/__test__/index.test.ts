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

it("returs orders and associated ticlets", async () => {
  //create three tickets, save

  const ticketOne = await buildTicket("metallica", 50);
  const ticketTwo = await buildTicket("gnr", 20);
  const ticketThree = await buildTicket("pantera", 60);
  //create 1 order as user 1, 2 orders for useer 2,

  const userOne = global.signin();
  const userTwo = global.signin();

  await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  //CHECK OUT THE DESTRUCTURING + RENAME SYNTAX
  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);
  const { body: orderTwo } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  // make req to Find orders for user 2

  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .expect(200);

  expect(response.body.length).toEqual(2);
});
