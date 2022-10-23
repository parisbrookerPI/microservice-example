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

const router = express.Router();

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
    const existingOrder = await Order.findOne({
      ticket: ticket,
      status: {
        $in: [
          OrderStatus.Created,
          OrderStatus.Complete,
          OrderStatus.AwaitingPayment,
        ],
      },
    });

    if (existingOrder) {
      throw new BadRequestError("The ticket is reserved");
    }

    //Calculate the expiration date of the order

    //Create the order and save to the database

    //Publish the event to say order was created (Will need to create common)

    res.send({});
  }
);

export { router as newOrderRouter };
