import express, { Request, Response } from "express";
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  ForbiddenError,
  BadRequestError,
} from "@parisbtickets/common";
import { Ticket } from "../models/Ticket";
import { body } from "express-validator";
import { TicketUpdatedPublisher } from "../events/publishers/TicketUpdatedPublisher";
import { natsWrapper } from "../NatsWrapper";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new ForbiddenError();
    }

    if (ticket.orderId) {
      throw new BadRequestError("Ticket is already reserved");
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });
    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
