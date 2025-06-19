import mongoose from "mongoose"
import { Comment } from "../models/comment.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video

    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if(!videoId?.trim())
        throw new ApiError(400, "Video ID is missing")

    const aggregation = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(String(videoId))
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
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
                            username: 1,
                            avatar: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                },
                video: {
                    $first: "$video"
                }
            }
        }
    ])

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const comments = await Comment.aggregatePaginate(aggregation, options);

    return res
    .status(200)
    .json(new ApiResponse(200, comments, "Video Comments Fetched"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const { videoId } = req.params
    const { content } = req.body

    if(!videoId?.trim())
        throw new ApiError(400, "Video ID is missing")

    if(!content?.trim())
        throw new ApiError(400, "Content is required")

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if(!comment)
        throw new ApiError(500, "Something went wrong while creating comment data")

    return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment Added Successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}