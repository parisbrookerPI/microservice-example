import express, { Request, Response, Router } from "express";
import {
  ForbiddenError,
  NotFoundError,
  requireAuth,
} from "@parisbtickets/common";
import { Order } from "../models/Order";

const router = express.Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate("ticket");
    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new ForbiddenError();
    }

    res.send({ order });
  }
);

export { router as showOrderRouter };
