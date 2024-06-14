import Role from "../models/role.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"


export const createRole = asyncHandler(async (req , res)=>{
    const {roleType , description , permission} = req.body;

     // Check if any required fields are empty
     if ([roleType , description ].some(field => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
            
    const existRole = await Role.findOne({roleType});
    if(existRole){
        throw new ApiError(400 , `Role as ${roleType} already exist`)
    }

    const roleDetail = await Role.create({
        roleType,
        description,
        permission
    })

    const checkRole = await Role.findById({_id : roleDetail._id})
    if(!checkRole){
        throw ApiError(500 , `Failed to create Role as ${roleType}`)
    }

    return res.status(200).json(
        new ApiResponse(200 , checkRole , "Role is created Successfully")
    )

})

export const getAllRoles = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalRoles = await Role.countDocuments();
    const roleList = await Role.find().populate('permission').skip(startIndex).limit(limit);

    const pageCount = Math.ceil(totalRoles / limit);

    if (!roleList || roleList.length === 0) {
        throw new ApiError(404, "No roles found");
    }

    return res.status(200).json(new ApiResponse(200, {
        roles: roleList,
        totalCount: totalRoles,
        limit,
        pageCount,
        currentPage: page
    }, "Roles fetched successfully"));
});

export const updateRole = asyncHandler(async (req, res) => {
    const roleId = req.params.id;
    const { roleType, description, permissions } = req.body;

    if (!roleId) {
        throw new ApiError(400, "Role ID is required");
    }

    let role = await Role.findById(roleId);
    if (!role) {
        throw new ApiError(404, `Role with ID '${roleId}' not found`);
    }

    role.roleType = roleType;
    role.description = description;
    role.permissions = permissions;

    role = await role.save();

    return res.status(200).json(new ApiResponse(200, role, "Role updated successfully"));
});


export const deleteRole = asyncHandler(async (req, res) => {
    const roleId = req.params.id;
    if (!roleId) {
        throw new ApiError(400, "Role ID is required");
    }
    const role = await Role.findByIdAndRemove(roleId);
    if (!role) {
        throw new ApiError(404, `Role with ID '${roleId}' not found`);
    }

    return res.status(200).json(new ApiResponse(200, null, `Role with ID '${roleId}' deleted successfully`));
});

export const getRoleById = asyncHandler(async (req, res) => {
    const roleId = req.params.id;
    if (!roleId) {
        throw new ApiError(400, "Role ID is required");
    }
    const role = await Role.findById(roleId).populate('permission');
    if (!role) {
        throw new ApiError(404, `Role with ID '${roleId}' not found`);
    }
    return res.status(200).json(new ApiResponse(200, role, `Role with ID '${roleId}' fetched successfully`));
});