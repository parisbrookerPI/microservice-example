import request from "supertest";
import { app } from "../../app";

// Basic route unit tests

it("returns a 201 on successful signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);
});

it("returns a 400 with invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "testtest.com",
      password: "password",
    })
    .expect(400);
});

it("returns a 400 with invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "pa",
    })
    .expect(400);
});

it("returns a 400", async () => {
  await request(app).post("/api/users/signup").send({
    email: null,
    password: "password",
  });

  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "pa",
    })
    .expect(400);
});

it("prevents duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(400);
});

// Check that the cookie is set appropriately
// But introduces a technical issue to do with cookie session SSL setting
// (secure: true)
it("sets cookie after successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  expect(response.get("Set-Cookie")).toBeDefined();
});
