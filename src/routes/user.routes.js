import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccoutDetails, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory 
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import verifyJWT from "../middlewares/auth.middlewares.js";

const router = Router()

router.route('/register').post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser)
router.route('/login').post(loginUser)

//Secure Routes
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.route('/update-account').patch(verifyJWT, updateAccoutDetails)

router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar)
router.route('/cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage)

router.route('/c/:username').get(verifyJWT, getUserChannelProfile)
router.route('/history').get(verifyJWT, getWatchHistory)

export default router