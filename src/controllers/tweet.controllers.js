import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body

    if(!content)
        throw new ApiError(404, "Content is required")

    const tweet = await Tweet.create({
        owner: req.user?._id,
        content
    })

    if(!tweet)
        throw new ApiError(500, "Something went wrong while saving data")

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet Created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    //TODO: get user tweets
    const { userId } = req.params

    if(!userId)
        throw new ApiError(404, "User ID is required")

    const isValidUserId = isValidObjectId(userId)

    if(!isValidUserId)
        throw new ApiError(400, "Invalid User ID")

    const tweet = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(String(userId))
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ])

    if(!tweet)
        throw new ApiError(500, "Something went wrong while getting the data")

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweets Fetched"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body

    if(!tweetId)
        throw new ApiError(404, "Tweet ID is required")

    const isValidTweetId = isValidObjectId(tweetId)

    if(!isValidTweetId)
        throw new ApiError(400, "Invalid Tweet ID")

    if(!content)
        throw new ApiError(404, "Content is required")

    const preTweet = await Tweet.findById(tweetId)

    if(!preTweet)
        throw new ApiError(400, "Invalid Tweet ID")

    if(preTweet.owner.toString() !== req.user?._id.toString())
        throw new ApiError(403, "You are not authorized to update this tweet")

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet Updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if(!tweetId)
        throw new ApiError(404, "Tweet ID is required")

    const isValidTweetId = isValidObjectId(tweetId)

    if(!isValidTweetId)
        throw new ApiError(400, "Invalid Tweet ID")

    const preTweet = await Tweet.findById(tweetId)

    if(!preTweet)
        throw new ApiError(400, "Invalid Tweet ID")

    if(preTweet.owner.toString() !== req.user?._id.toString())
        throw new ApiError(403, "You are not authorized to delete this tweeet")

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet Deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}