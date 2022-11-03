import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@parisbtickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./QueueGroupName";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;

  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log(`Waiting ${delay / 1000} seconds`);

    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay: 10000,
      }
    );
    msg.ack();
  }
}
