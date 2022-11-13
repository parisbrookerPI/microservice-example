import express, { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@parisbtickets/common";
import { body } from "express-validator";
import { Order } from "../models/Orders";
import { Payment } from "../models/Payment";
import { stripe } from "../stripe";
import { PaymentCreatedPublisher } from "../events/publisers/PaymentEventPublisher";
import { natsWrapper } from "../NatsWrapper";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new ForbiddenError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Order is cancelled, cannot make payment");
    }

    const charge = await stripe.charges.create({
      currency: "gbp",
      amount: order.price * 100,
      source: token,
    });

    const payment = await Payment.build({
      orderId,
      stripeId: charge.id,
    });

    await payment.save();

    // await new PaymentCreatedPublisher(natsWrapper.client).publish({
    //   id: payment.id,
    //   orderId: payment.orderId,
    //   stipeId: payment.stripeId,
    // });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
