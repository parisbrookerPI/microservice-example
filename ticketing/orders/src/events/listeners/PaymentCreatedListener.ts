import { Message } from "node-nats-streaming";
import {
  Listener,
  OrderStatus,
  Subjects,
  PaymentCreatedEvent,
} from "@parisbtickets/common";
import { Ticket } from "../../models/Ticket";
import { Order } from "../../models/Order";
import { queueGroupName } from "./QueueGroupName";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    // Look at data object for title and price
    const { orderId, stipeId, id } = data;

    const order = await Order.findById(id);

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();

    msg.ack();
  }
}
