import {
  PaymentCreatedEvent,
  Subjects,
  Publisher,
} from "@parisbtickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
