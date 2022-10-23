import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/TicketCreatedPublisher";

console.clear();

const stan = nats.connect("ticketing", "abc", {
  url: "http://127.0.0.1:4222",
});

stan.on("connect", async () => {
  console.log("Publisher connected to NATS");

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: "gh3744",
      price: 33,
      title: "Metallica",
    });
  } catch (err) {
    console.error(err);
  }

  //   const data = JSON.stringify({
  //     id: "123",
  //     title: "concert",
  //     price: 20,
  //   });

  //   stan.publish("ticket:created", data, () => {
  //     console.log("event published");
  //   });
});
