import { Message } from "node-nats-streaming";
import {
  Subjects,
  Listener,
  ExpirationCompleteEvent,
  OrderStatus,
} from "@parisbtickets/common";
import { Ticket } from "../../models/Ticket";
import { queueGroupName } from "./QueueGroupName";
import { Order } from "../../models/Order";
import { OrderCancelledPublisher } from "../publishers/OrderCancelledPublisher";

export class ExpirationCompleteListener extends Listener<
  ExpirationCompleteEvent
> {
  queueGroupName = queueGroupName;
  readonly subject = Subjects.ExpirationComplete;

  async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket");

    if (!order) {
      throw new Error("Order not found");
    }
    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id, //THIS WILL REQUIRE populate to be called in the Mongoose query
      },
    });

    msg.ack();
  }
}
