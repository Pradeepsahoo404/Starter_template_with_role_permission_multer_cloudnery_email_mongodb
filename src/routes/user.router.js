import {Router} from "express"
import { registerUser ,
         loginUser,
         logoutUser,
         refreshAccessToken,
         changeCurrentPassword,
         updateAccountDetail,
         updateProfilePicture,
         updateCoverImage,
         forgetPassword

} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { auth , authorizeRoles} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.fields([{name : "profilePicture" , maxCount : 1} , {name : "coverImage" , maxCount : 1}]) , registerUser)

router.route("/login").post(loginUser)

//secured route
router.route("/logout").post( auth, logoutUser)

router.route("/refreshAccessToken").post(refreshAccessToken)

router.route("/changeCurrentPassword").post(auth , changeCurrentPassword)

router.route("/forgetPassword").post(forgetPassword)

router.route("/updateAccountDetail").put( auth ,updateAccountDetail)

router.route("/updateProfilePicture").put(auth , upload.single("profilePicture"), updateProfilePicture)

router.route("/updateCoverImage").put(auth , upload.single("coverImage"), updateCoverImage)

export default router;