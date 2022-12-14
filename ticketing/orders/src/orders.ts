import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./NatsWrapper";
import { TicketCreatedListener } from "./events/listeners/TicketCreatedListeners";
import { TicketUpdatedListener } from "./events/listeners/TicketUpdatedListener";
import { ExpirationCompleteListener } from "./events/listeners/ExpirationCompleteListener";
import { PaymentCreatedListener } from "./events/listeners/PaymentCreatedListener";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY is not defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID is not defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL is not defined");
  }
  if (!process.env.CLUSTER_ID) {
    throw new Error("CLUSTER_ID is not defined");
  }

  console.log(process.env.NATS_CLIENT_ID);

  //Nats and mongo connections

  try {
    await natsWrapper.connect(
      process.env.CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on("close", () => {
      console.log("Nats conn closed");
      process.exit();
    });

    process.on("SIGINT", () => natsWrapper.client!.close());
    process.on("SIGTERM", () => natsWrapper.client!.close()); // Good practice not to hide this away in a class file

    //Set up event listeners:

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo connection successful");
  } catch (err) {
    console.error(err);
  }
  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
};

start();
