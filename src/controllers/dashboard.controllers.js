import mongoose from "mongoose"
import { Video } from "../models/video.models.js"
import { Subscription } from "../models/subscription.models.js"
import { Like } from "../models/like.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
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