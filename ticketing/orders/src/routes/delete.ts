import {
  ForbiddenError,
  NotFoundError,
  OrderStatus,
  requireAuth,
} from "@parisbtickets/common";
import express, { Request, Response, Router } from "express";
import { Order } from "../models/Order";
import { OrderCancelledPublisher } from "../events/publishers/OrderCancelledPublisher";
import { natsWrapper } from "../NatsWrapper";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    //get the order
    const order = await Order.findById(req.params.orderId).populate("ticket");
    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new ForbiddenError();
    }

    // Update the order status to cancelled
    order.status = OrderStatus.Cancelled;

    await order.save();
    //Publish an event

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    // return the cancelled order

    res.status(204).send({ order });
  }
);

export { router as deleteOrderRouter };
