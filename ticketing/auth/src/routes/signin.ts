import express, { Request, Response, NextFunction } from "express"; // Have to import these to satisfy TS
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { User } from "../models/User";
import { Password } from "../services/Password";
import { validateRequest } from "@parisbtickets/common";
import { BadRequestError } from "@parisbtickets/common";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("email must be valid"),
    body("password").trim().notEmpty().withMessage("No password provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("Login Failed");
    }

    const passwordsMatch = await Password.comapre(
      existingUser.password,
      password
    );

    if (!passwordsMatch) {
      throw new BadRequestError("Login Failed");
    }

    // generrate JWT,
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY! // ! tells TS it is actually defined
    );

    // store on session object
    req.session = { jwt: userJwt };

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
