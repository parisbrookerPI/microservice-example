import { Listener, OrderCreatedEvent, Subjects } from "@parisbtickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./QueueGroupName";
import { Order } from "../../models/Orders";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;

  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const order = await Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });

    await order.save();

    msg.ack();
  }
}
