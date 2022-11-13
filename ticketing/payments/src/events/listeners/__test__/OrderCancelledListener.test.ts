import { natsWrapper } from "../../../NatsWrapper";
import { Message } from "node-nats-streaming";
import { OrderCancelledListener } from "../OrderCancelledListener";
import { OrderCancelledEvent, OrderStatus } from "@parisbtickets/common";
import mongoose, { version } from "mongoose";
import { Order } from "../../../models/Orders";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: "assfdsa",
    version: 0,
  });
  await order.save();

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: "sassd",
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it("update the status of the order", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);
  expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
