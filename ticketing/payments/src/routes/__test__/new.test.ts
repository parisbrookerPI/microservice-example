import { OrderStatus } from "@parisbtickets/common";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/Orders";
import { Payment } from "../../models/Payment";

import { stripe } from "../../stripe";

// jest.mock("../../stripe.ts");

it("returns 404 when purchasing an order that does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "aeeaw",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("returns 401 when purchasing an order that does not belong to user", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 33,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "aeeaw",
      orderId: order.id,
    })
    .expect(401);
});

it("returns 400 when purchasing a cancelled order", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 33,
    status: OrderStatus.Cancelled,
    userId: userId,
    version: 0,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "aeeaw",
      orderId: order.id,
    })
    .expect(400);
});

const price = Math.floor(Math.random() * 100000);

// using a mock

// it("retuns 204 on successful payment", async () => {
//   const userId = new mongoose.Types.ObjectId().toHexString();

//   const order = Order.build({
//     id: new mongoose.Types.ObjectId().toHexString(),
//     price: 33,
//     status: OrderStatus.Cancelled,
//     userId: userId,
//     version: 0,
//   });

//   await order.save();

//   await request(app)
//     .post("/api/payments")
//     .set("Cookie", global.signin(userId))
//     .send({
//       token: "tok_visa",
//       orderId: order.id,
//     })
//     .expect(201);
// });

//using the API

it("retuns 204 on successful payment", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = await Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price,
    status: OrderStatus.Created,
    userId: userId,
    version: 0,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({
    limit: 10,
  });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  //checks value is not undefind only (not null)
  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual("gbp");

  const payment = await Payment.findOne({
    ordrId: order.id,
    stripeId: stripeCharge!.id,
  });

  //Cannot ue toBeDefined() as null would return true.
  expect(payment).not.toBe(null);
});
