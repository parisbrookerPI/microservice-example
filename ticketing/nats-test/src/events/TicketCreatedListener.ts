import { Listener } from "./BaseListener";
import nats, { Message, Stan } from "node-nats-streaming";
import { TicketCreatedEvent } from "./TicketCreatedEvent";
import { Subjects } from "./Subjects";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = "payments-service";

  onMessage(data: TicketCreatedEvent["data"], msg: Message): void {
    console.log("Business Logic Here on the", data);

    console.log(data.id, data.title);

    msg.ack();
  }
}
