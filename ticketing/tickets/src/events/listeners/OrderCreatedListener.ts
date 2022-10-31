import { Listener } from "@parisbtickets/common";
import mongoose from "mongoose";
import { OrderCreatedEvent, TicketCreatedEvent } from "@parisbtickets/common";
import { Subjects } from "@parisbtickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import { queueGroupName } from "./QueueGroupName";
import { TicketUpdatedPublisher } from "../publishers/TicketUpdatedPublisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    //Find ticket that the order is reserving

    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket, throw an error
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Mark ticket as reserved by setting orderId property

    ticket.set({ orderId: data.id });

    // Save the ticket

    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    // ack the message
    msg.ack();
  }
}
