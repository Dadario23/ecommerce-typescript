import mongoose, { Schema, Document, models } from "mongoose";

export interface ISetting extends Document {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeDescription: string;
  shippingCost: number;
  freeShippingThreshold: number;
  instagramUrl: string;
  facebookUrl: string;
  whatsappNumber: string;
  updatedAt: Date;
}

const SettingSchema = new Schema(
  {
    storeName:             { type: String, default: "Compumobile" },
    storeEmail:            { type: String, default: "" },
    storePhone:            { type: String, default: "" },
    storeDescription:      { type: String, default: "" },
    shippingCost:          { type: Number, default: 0 },
    freeShippingThreshold: { type: Number, default: 0 },
    instagramUrl:          { type: String, default: "" },
    facebookUrl:           { type: String, default: "" },
    whatsappNumber:        { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);
