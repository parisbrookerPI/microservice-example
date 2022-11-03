import { natsWrapper } from "../../../NatsWrapper";
import { ExpirationCompleteEvent } from "@parisbtickets/common";
import { OrderStatus } from "@parisbtickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/Ticket";
import { Order } from "../../../models/Order";
import mongoose, { set } from "mongoose";
import { ExpirationCompleteListener } from "../ExpirationCompleteListener";

const setup = async () => {
  //create an instance of the listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  //Build a ticket

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 333,
    title: "some show",
  });

  await ticket.save();

  // create an order
  const order = Order.build({
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket: ticket,
    userId: "wewe",
  });

  await order.save();

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  //create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { order, listener, ticket, data, msg };
};

it("Updated the order sstatus too cancelled", async () => {
  const { order, listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits an OrderCancelled event", async () => {
  const { order, listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.id).toEqual(order.id);
});

it("acks the msg", async () => {
  const { order, listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
