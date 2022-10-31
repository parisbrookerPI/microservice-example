import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// core attrs
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

// Gives us the opportunity to add attributes later
interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  version: number; //Updated __v to version
  orderId?: string;
}

// the build function that allows TypeScript to be happy
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    orderId: { type: String },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

//Changes __v to version
ticketSchema.set("versionKey", "version");

// Initializes plugin
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
