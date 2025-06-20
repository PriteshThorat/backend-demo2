import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    const { videoId } = req.params

    if(!videoId)
        throw new ApiError(404, "Video ID is required")

    if(!isValidObjectId(videoId))
        throw new ApiError(400, "Invalid Video ID")

    const preLike = await Like.findOne({
        $and: [{ video: videoId }, { likedBy: req.user?._id }]
    })

    if(preLike){
        await Like.findByIdAndDelete(preLike._id)

        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Unliked to video successfully"))
    }

    const like = await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, like, "Liked to video successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment
    const { commentId } = req.params

    if(!commentId)
        throw new ApiError(404, "Comment ID is required")

    if(!isValidObjectId(commentId))
        throw new ApiError(400, "Invalid Comment ID")

    const preLike = await Like.findOne({
        $and: [{ comment: commentId }, { likedBy: req.user?._id }]
    })

    if(preLike){
        await Like.findByIdAndDelete(preLike._id)

        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Unliked to Comment successfully"))
    }

    const like = await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, like, "Liked to Comment successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet
    const { tweetId } = req.params

    if(!tweetId)
        throw new ApiError(404, "Tweet ID is required")

    if(!isValidObjectId(tweetId))
        throw new ApiError(400, "Invalid Tweet ID")

    const preLike = await Like.findOne({
        $and: [{ tweet: tweetId }, { likedBy: req.user?._id }]
    })

    if(preLike){
        await Like.findByIdAndDelete(preLike._id)

        return res
        .status(200)
        .json(new ApiResponse(200, {}, "Unliked to Tweet successfully"))
    }

    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, like, "Liked to Tweet successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const like = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(String(req.user?._id)),
                video: { 
                    $exists: true, 
                    $ne: null 
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        }
    ])

    if(!like)
        throw new ApiError(500, "Something went wrong")

    return res
    .status(200)
    .json(new ApiResponse(200, like, "Liked Videos Fetched"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}