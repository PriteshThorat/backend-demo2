import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { User } from "../models/user.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import { registerUser } from "./user.controllers.js"


const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const matchStage = {};

    if(query) 
        matchStage.title = { $regex: query, $options: 'i' };

    if(userId) 
        matchStage.owner = new mongoose.Types.ObjectId(String(userId));

    const sortStage = {};
    sortStage[sortBy || 'createdAt'] = sortType === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const parsedLimit = parseInt(limit);

    const video = await Video.aggregate([
        {
            $match: matchStage
        },
        {
            $sort: sortStage
        },
        {
            $facet: {
                data: [
                    {
                        $skip: skip
                    },
                    {
                        $limit: parsedLimit
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
                            }
                        }
                    },
                ],
                totalCount: [
                    {
                        $count: 'count'
                    }
                ]
            }
        },
        {
            $project: {
                data: 1,
                total: { 
                    $arrayElemAt: ["$totalCount.count", 0] 
                }
            }
        }
    ])

    if(!video || video.length === 0 || !video[0].data || video[0].data.length === 0)
        throw new ApiError(404, "No Data Found")

    return res
    .status(200)
    .json(new ApiResponse(200, video[0].data, "Fetched All Video Data"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    if([title, description].some(field => (field?.trim() === "")))
        throw new ApiError(404, "All Fields are required")

    let videoFileLocalPath
    if(req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0)
        videoFileLocalPath = await req.files.videoFile[0].path

    let thumbnailLocalPath
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0)
        thumbnailLocalPath = await req.files.thumbnail[0].path

    if(!videoFileLocalPath)
        throw new ApiError(400, "Video file is required")

    if(!thumbnailLocalPath)
        throw new ApiError(400, "Thumbnail file is required")

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user?._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Data Saved Successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!videoId?.trim())
        throw new ApiError(400, "Video ID is missing")

    const video = await Video.findById(videoId)

    if(!video)
        throw new ApiError(404, "Video Does not exist")

    const videoAggregate = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(String(video._id))
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
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                owner: 1,
            }
        }
    ])

    if(!videoAggregate?.length)
        throw new ApiError(404, "Video Does not exits")

    return res
    .status(200)
    .json(new ApiResponse(200, videoAggregate, "Video Data Fetched"))
})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params
    const { title, description } = req.body

    if(!videoId?.trim())
        throw new ApiError(400, "Video ID is missing")

    if(!title || !description)
        throw new ApiError(404, "All Fields are required")

    const thumbnailLocalPath = req.file?.path

    if(!thumbnailLocalPath)
        throw new ApiError(400, "Thumbnail file is missing")
    
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail)
        throw new ApiError(400, "Error while uploading on cloudinary")

    const videoPreData = await Video.findById(videoId)

    if(!videoPreData)
        throw new ApiError(404, "Video Data Not Found")

    if(videoPreData.owner.toString() !== req.user?._id.toString())
        throw new ApiError(403, "You are not authorized to update this video")

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail.url,
                title,
                description
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Data updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video
    const { videoId } = req.params

    if(!videoId?.trim())
        throw new ApiError(400, "Video ID is missing")

    const videoPreData = await Video.findById(videoId)

    if(!videoPreData)
        throw new ApiError(404, "Video Data Not Found")

    if(videoPreData.owner.toString() !== req.user?._id.toString())
        throw new ApiError(403, "You are not authorized to delete this video")

    await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Data deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId?.trim())
        throw new ApiError(400, "Video ID is missing")

    const videoPreData = await Video.findById(videoId)

    if(!videoPreData)
        throw new ApiError(404, "Video Data Not Found")

    if(videoPreData.owner.toString() !== req.user?._id.toString())
        throw new ApiError(403, "You are not authorized to toggle the status of this video")

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !videoPreData.isPublished
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Public Status Toggled"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}