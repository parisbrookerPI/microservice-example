import express from "express";
// Makes async error handlig easy
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import {
  NotFoundError,
  errorHandler,
  currentUser,
} from "@parisbtickets/common";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test", //to allow jest to do cookie tests
  })
);
app.use(currentUser);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
