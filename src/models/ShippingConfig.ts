import mongoose, { Schema, Document } from "mongoose";

export interface IShippingZone {
  id: string;
  name: string;
  localities: string[];
  flex: number;
  standard: number;
}

export interface IShippingConfig extends Document {
  zones: IShippingZone[];
}

const ZoneSchema = new Schema<IShippingZone>(
  {
    id:           { type: String, required: true },
    name:         { type: String, required: true },
    localities:   [{ type: String }],
    flex:         { type: Number, required: true },
    standard:     { type: Number, required: true },
  },
  { _id: false },
);

const ShippingConfigSchema = new Schema<IShippingConfig>(
  { zones: [ZoneSchema] },
  { timestamps: true },
);

if (process.env.NODE_ENV !== "production" && mongoose.models["ShippingConfig"]) {
  delete (mongoose.models as Record<string, unknown>)["ShippingConfig"];
}

export default (mongoose.models["ShippingConfig"] as mongoose.Model<IShippingConfig>) ||
  mongoose.model<IShippingConfig>("ShippingConfig", ShippingConfigSchema);
