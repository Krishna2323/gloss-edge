import { Schema, models, model, Document } from "mongoose";

export interface ILocation {
  name: string;
  state?: string;
  active: boolean;
}

export interface ILocationDoc extends ILocation, Document {}
const LocationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    state: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Location =
  models?.Location || model<ILocation>("Location", LocationSchema);

export default Location;
