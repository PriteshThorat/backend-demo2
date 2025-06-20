import mongoose from "mongoose"
import { Video } from "../models/video.models.js"
import { Subscription } from "../models/subscription.models.js"
import { Like } from "../models/like.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const totalVideos = await Video.countDocuments({
        owner: req.user?._id
    })

    if(!totalVideos)
        throw new ApiError(500, "Something went wrong while fetching total Videos documnet")

    const totalSubscribers = await Subscription.countDocuments({
        channel: req.user?._id
    })

    if(!totalSubscribers)
        throw new ApiError(500, "Something went wrong while fetching total Subscribers documnet")

    const totalLikes = await Like.countDocuments({
        video: {
            $in: await Video.find({ owner: req.user?._id }).distinct("_id"),
        }
    })

    if(!totalLikes)
        throw new ApiError(500, "Something went wrong while fetching total Likes documnet")

    const totalViews = await Video.aggregate([
        {
            $match: {
                owner: req.user?._id
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ])

    if(!totalViews)
        throw new ApiError(500, "Something went wrong while fetching total Views documnet")

    return res
    .status(200)
    .json(new ApiResponse(200, { totalVideos, totalSubscribers, totalLikes, totalViews: totalViews[0]?.totalViews || 0}, "Channel Data fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const video = await Video.find({
        owner: req.user?._id
    })

    if(!video)
        throw new ApiError(500, "Something went wrong while fetching data")
    
    return res
    .status(200)
    .json(new ApiResponse(200, video, "All Videos fetched successfully"))
})

export { getChannelStats, getChannelVideos }