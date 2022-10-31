import { natsWrapper } from "../../../NatsWrapper";
import { OrderCreatedEvent, OrderStatus } from "@parisbtickets/common";
import { OrderCreatedListener } from "../OrderCreatedListener";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/Ticket";
import mongoose from "mongoose";

const setup = async () => {
  //create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    title: "Concet",
    price: 94,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  //Create fake data event

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: "string;",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  //create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it("sets the userId of the ticket", async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  //call the on message function with the data object + message object
  await listener.onMessage(data, msg);
  //write assertions to make sure ack is called
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  // How to do deeper inspection of mockfunctions

  let ticketUpdatedData = (natsWrapper.client.publish as jest.Mock).mock
    .calls[0][1];
  ticketUpdatedData = JSON.parse(ticketUpdatedData);

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
