import { natsWrapper } from "./NatsWrapper";
import { OrderCreatedListener } from "./events/listeners/OrderCreatedListener";

const start = async () => {
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID is not defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL is not defined");
  }
  if (!process.env.CLUSTER_ID) {
    throw new Error("CLUSTER_ID is not defined");
  }

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
  } catch (err) {
    console.error(err);
  }

  new OrderCreatedListener(natsWrapper.client).listen();
};

start();
