import { Ticket } from "../Ticket";

it("implements OCC", async () => {
  //Create and instance of a ticket

  const ticket = Ticket.build({
    title: "Concert",
    price: 5,
    userId: "23fsdf",
  });

  //Save the ticket to db

  await ticket.save();

  //Fetch ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  //make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  //save the first fetched ticket

  await firstInstance!.save();

  // save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error("Should not reach");
});

it("increments version by 1", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 5,
    userId: "23fsdf",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
