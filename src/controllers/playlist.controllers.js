import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    const { name, description } = req.body

    if(!name || !description)
        throw new ApiError(404, "All Fields are required")

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if(!playlist)
        throw new ApiError(500, "Something went wrong while creating playlist")

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists
    const { userId } = req.params

    if(!userId)
        throw new ApiError(404, "User ID is required")

    if(!isValidObjectId(userId))
        throw new ApiError(400, "Invalid User ID")

    const playlist = await Playlist.aggregate([
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
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
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
                                        avatar: 1,
                                        username: 1
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

    if(!playlist)
        throw new ApiError(500, "Invalid User ID")

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "User Playlist Fetched"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id
    const { playlistId } = req.params

    if(!playlistId)
        throw new ApiError(404, "Playlist ID is required")

    if(!isValidObjectId(playlistId))
        throw new ApiError(400, "Invalid Playlist ID")

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(String(playlistId))
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
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
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
                                        avatar: 1,
                                        username: 1
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

    if(!playlist)
        throw new ApiError(400, "Invalid Playlist ID")

    return res
    .status(200)
    .json(new ApiResponse(200, playlist[0], "Playlist Data Fetched"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    //TODO: Add video to playlist
    const { playlistId, videoId } = req.params

    if(!playlistId || !videoId)
        throw new ApiError(404, "Playlist and Video ID are required")

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId))
        throw new ApiError(400, "Invalid Playlist ID or Video ID")

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )

    if(!playlist)
        throw new ApiError(400, "Invalid Playlist ID")

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video Added to Playlist Successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    const { playlistId, videoId } = req.params

    if(!playlistId || !videoId)
        throw new ApiError(404, "Playlist and Video ID is required")

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId))
        throw new ApiError(400, "Invalid Playlist ID or Video ID")

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )

    if(!playlist)
        throw new ApiError(400, "Invalid Playlist ID")

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video removed from playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}