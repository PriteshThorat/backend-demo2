import mongoose, { Schema } from "mongoose";

const subscriptionSchema = Schema({
    subscriber: {
        type: Schema.ObjectId.Types,
        ref: "User"
    },
    channel: {
        type: Schema.ObjectId.Types,
        ref: "User"
    }
}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema)