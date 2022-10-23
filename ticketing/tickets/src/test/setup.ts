import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// declare global {
//   namespace NodeJS {
//     export interface Global {
//       signin(): Promise<string[]>;
//     }
//   }
// }

declare global {
  var signin: () => string[];
}

jest.mock("../NatsWrapper.ts");

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = "asdf";
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
export = (global.signin = () => {
  // Build a jwt payload {id, email }

  const id = new mongoose.Types.ObjectId().toHexString();
  const payload = {
    id: `${id}`, //With the id hardcoded, can only have one user... need to make this dynamic
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
