import nats from "node-nats-streaming";
import {
  ServiceBusClient,
  ServiceBusMessage,
  ServiceBusMessageBatch,
} from "@azure/service-bus";

const connectionString =
  process.env.SERVICEBUS_CONNECTION_STRING ||
  "Endpoint=sb://parisb-test.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=TgfCoDiNBN+xJb6J4tXM3EGFUdhwXmYicNwEMuRnDGE=";
const queueName = process.env.QUEUE_NAME || "testqueue";

console.clear();

const client = nats.connect("ticketing", "abc", {
  url: "http://127.0.0.1:4222",
});

client.on("connect", () => {
  console.log("Publisher connected to NATS");

  const data = JSON.stringify({
    id: "123",
    title: "concert",
    price: 20,
  });

  client.publish("ticket:created", data, () => {
    console.log("event published");
  });
});

const firstSetOfMessages: ServiceBusMessage[] = [
  { body: "Albert Einstein" },
  { body: "Werner Heisenberg" },
  { body: "Marie Curie" },
  { body: "Steven Hawking" },
  { body: "Isaac Newton" },
];

const sbClient = new ServiceBusClient(connectionString);

// createSender() can also be used to create a sender for a topic.
const sender = sbClient.createSender(queueName);

const sending = async () => {
  await sender.sendMessages(firstSetOfMessages);

  console.log(`Sending one scientists`);
  const message: ServiceBusMessage = {
    contentType: "application/json",
    subject: "Scientist",
    body: { firstName: "Albert", lastName: "Einstein" },
    timeToLive: 2 * 60 * 1000, // message expires in 2 minutes
  };
  await sender.sendMessages(message);
};

sending();
