import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// declare global {
//   namespace NodeJS {
//     export interface Global {
//       signin(id?: string): Promise<string[]>;
//     }
//   }
// }

declare global {
  var signin: (id?: string) => string[];
}

jest.mock("../NatsWrapper.ts");

process.env.STRIPE_KEY =
  "sk_test_51M3LmEFZr4yUTPzDjkuWwBLhl8SnNtEH5x3AhTzqjilL73H3PcKyftOq5ARtHcAApBoyC2aPlee6P4YeJPCcOmgl00b33FNHo5";

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = "asdf";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

//Helper function to get cokkie for other tests
export = (global.signin = (id?: string) => {
  // Build a jwt payload {id, email }

  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  // Create the jwt! (using the key)
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build the session object - take the jwt and put it in an {jwt: myJwt}

  const session = { jwt: token };

  // Turn session object into {}

  const sessionJSON = JSON.stringify(session);

  // Encode session in base 64

  const base64 = Buffer.from(sessionJSON).toString("base64");

  // Return string of encoded data

  return [`session=${base64}`];
});
