# Testing strategy

- Test microservices in isolation
  - Basic request handling
- Unit testing
  - Isolated functions
- Event handling
  - Can service handle events?

# Dependencies

`npm i --save-dev @types/jest @types/supertest jest ts-jest supertest mongodb-memory-server`

# In-mem mongo setup

In the upcoming lecture, we will be setting up our test environment with MongoMemoryServer. If you are using the latest versions of this library a few changes will be required:

In auth/src/test/setup.ts, change these lines:

```
mongo = new MongoMemoryServer();
const mongoUri = await mongo.getUri();
```

to this:

```
const mongo = await MongoMemoryServer.create();
const mongoUri = mongo.getUri();
```

Remove the useNewUrlParser and useUnifiedTopology parameters from the connect method. Change this:

```
await mongoose.connect(mongoUri, {
useNewUrlParser: true,
useUnifiedTopology: true,
});
```

to this:

`await mongoose.connect(mongoUri, {});`

Then, find the afterAll hook and add a conditional check:

```
afterAll(async () => {
if (mongo) {
await mongo.stop();
}
await mongoose.connection.close();
});
```

# Setup tooling

in package.json:

```
 "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "setupFilesAfterEnv": [
      "./src/test/setup.ts"
    ]
  },
```

## Env variables in testing environment

- quick option, add Env to testing hook
