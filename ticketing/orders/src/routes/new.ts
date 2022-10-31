import mongoose from "mongoose";
import express, { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@parisbtickets/common";
import { body } from "express-validator";
import { Ticket } from "../models/Ticket";
import { Order } from "../models/Order";
import { OrderCreatedPublisher } from "../events/publishers/OrderCreatedPublisher";
import { natsWrapper } from "../NatsWrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60; //This is a really drastic setting - could be set as an ENV variable, or saved in a db and manipulatable via a UI.

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be present"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    //Find ticket in the database

    const ticket = await Ticket.findById(ticketId);
    // --> respond if this failed
    if (!ticket) {
      throw new NotFoundError();
    }
    // --> Check the ticket is not reserved  --> Check that the ticket isn't associated with an order; if it is, make sure that the order status isn't cancelled
    // This is the kind of logic that should be extracted into a reusable function, as we'll need to check the existence of an order elsewhere.
    // Adding a method onto the ticket model is the answer.
    // const existingOrder = await Order.findOne({
    //   ticket: ticket,
    //   status: {
    //     $in: [
    //       OrderStatus.Created,
    //       OrderStatus.Complete,
    //       OrderStatus.AwaitingPayment,
    //     ],
    //   },
    // });

    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError("The ticket is reserved");
    }

    //Calculate the expiration date of the order

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    //Create the order and save to the database

    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });

    await order.save();

    //Publish the event to say order was created (Will need to create common)

    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
