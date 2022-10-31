import { Publisher, OrderCreatedEvent, Subjects } from "@parisbtickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
