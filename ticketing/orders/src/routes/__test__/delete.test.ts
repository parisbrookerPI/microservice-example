import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order, OrderStatus } from "../../models/Order";
import { Ticket } from "../../models/Ticket";
import { natsWrapper } from "../../NatsWrapper";

const buildTicket = async (title: string, price: number) => {
  const ticket = Ticket.build({
    title,
    price,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  return ticket;
};

it("updates order status to Cancelled", async () => {
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

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send({ ticketId: ticketOne.id })
    .expect(204);

  const cancelledOrder = await Order.findById(order.id);

  expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits an order cancelled event", async () => {
  const user = global.signin();

  const ticketOne = await buildTicket("metalica", 555);
  //request to build order with ticket

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // fetch ticket based on order ID

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send({ ticketId: ticketOne.id })
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
