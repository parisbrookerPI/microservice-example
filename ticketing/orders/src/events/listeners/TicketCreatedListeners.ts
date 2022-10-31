import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketCreatedEvent } from "@parisbtickets/common";
import { Ticket } from "../../models/Ticket";
import { queueGroupName } from "./QueueGroupName";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    // Look at data object for title and price
    const { title, price, id } = data;

    const ticket = Ticket.build({
      title,
      price,
      id,
    });

    await ticket.save();

    msg.ack();
  }
}
