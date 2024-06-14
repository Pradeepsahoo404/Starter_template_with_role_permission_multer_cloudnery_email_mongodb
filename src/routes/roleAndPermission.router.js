import { Router } from "express"
import { createRole , getAllRoles , getRoleById , updateRole , deleteRole  } from "../controllers/role.controller.js"
import { createPermission  ,getAllPermissions ,updatePermission , deletePermission , getPermissionById} from "../controllers/permission.controller.js";
import { auth , authorizeRoles } from "../middlewares/auth.middleware.js"

const router = Router();

//permission
router.route("/create_permission").post(auth, createPermission)

router.route("/get_all_permission").get(auth, getAllPermissions)

router.route("/get_permission_detail:/id").get(auth ,getPermissionById)

router.route("/update_permission:/id").put(auth ,updatePermission)

router.route("/delete_permisssion:/id").delete(auth, deletePermission)



//role
router.route("/create_role").post(auth ,createRole)

router.route("/get_all_roles").get(auth , getAllRoles)

router.route("/get_role_detail:/id").get(auth ,getRoleById)

router.route("/update_role:/id").put(auth ,updateRole)

router.route("/delete_role:/id").delete(auth ,deleteRole)




export default router