import { natsWrapper } from "../../../NatsWrapper";
import { Message } from "node-nats-streaming";
import { OrderCreatedListener } from "../OrderCreateListener";
import { OrderCreatedEvent, OrderStatus } from "@parisbtickets/common";
import mongoose from "mongoose";
import { Order } from "../../../models/Orders";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: "assdasd",
    userId: "wajoj",
    status: OrderStatus.Created,
    ticket: {
      id: "aiowjfoa",
      price: 12,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("replicates the order info", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);
  expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
