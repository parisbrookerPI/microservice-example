import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent } from "@parisbtickets/common";
import { Ticket } from "../../models/Ticket";
import { queueGroupName } from "./QueueGroupName";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    //Find the ticket, update it, save it
    // const ticket = await Ticket.findById(data.id);

    // //With addition of the versioning solution, we need to use a more granular query - but this is ugly and  can be added as a method on the Model
    // const ticket = await Ticket.findOne({
    //   _id: data.id,
    //   version: data.version - 1,
    // });

    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const { title, price } = data;
    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
