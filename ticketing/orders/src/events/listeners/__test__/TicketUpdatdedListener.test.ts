import { natsWrapper } from "../../../NatsWrapper";
import { TicketUpdatedListener } from "../TicketUpdatedListener";
import { TicketUpdatedEvent } from "@parisbtickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/Ticket";
import mongoose from "mongoose";

const setup = async () => {
  //create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  //Build a ticket

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 333,
    title: "some show",
  });

  await ticket.save();

  // create a fake data event
  const data: TicketUpdatedEvent["data"] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: ticket.title,
    price: 94,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  //create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it("finds, updates and saves", async () => {
  const { listener, data, msg } = await setup();

  //call the on mmessage function with the data object + message object
  await listener.onMessage(data, msg);
  //write assertions to make sure a ticket was created

  const updatedTicket = await Ticket.findById(data.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { listener, data, msg, ticket } = await setup();
  //call the on message function with the data object + message object
  await listener.onMessage(data, msg);
  //write assertions to make sure ack is called
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if events are out of sync", async () => {
  const { listener, data, msg, ticket } = await setup();
  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  //write assertions to make sure ack is called
  expect(msg.ack).not.toHaveBeenCalled();
});
