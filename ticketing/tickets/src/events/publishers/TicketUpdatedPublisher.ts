import { Publisher, Subjects, TicketUpdatedEvent } from "@parisbtickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
