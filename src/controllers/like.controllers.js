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
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}