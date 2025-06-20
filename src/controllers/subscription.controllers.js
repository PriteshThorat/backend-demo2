import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    //TODO: toggle subscription
    const { channelId } = req.params

    if(!channelId)
        throw new ApiError(404, "Channel ID is required")

    const isValidChannelId = isValidObjectId(channelId)

    if(!isValidChannelId)
        throw new ApiError(400, "Invalid Channel ID")

    if(channelId.toString() === req.user?._id.toString())
        throw new ApiError("You cannot subscribed to yourself")

    const preSubscription = await Subscription.findOne({
        $and: [{ channel: channelId }, { subscriber: req.user?._id }]
    })

    if(preSubscription){
        await Subscription.findByIdAndDelete(preSubscription._id)

        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Unsubscribed to Channel"))
    }

    const subscription = await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId
    })

    return res
    .status(200)
    .json(new ApiResponse(200, subscription, "Subscribed To Channel"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}