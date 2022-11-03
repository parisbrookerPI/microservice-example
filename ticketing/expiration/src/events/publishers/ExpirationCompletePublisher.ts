import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from "@parisbtickets/common";

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  readonly subject = Subjects.ExpirationComplete;
}
