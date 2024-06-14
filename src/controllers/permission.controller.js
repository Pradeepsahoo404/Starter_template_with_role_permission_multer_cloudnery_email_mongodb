import Permission from "../models/permission.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const createPermission = asyncHandler(async (req, res) => {
    const { permissionType, description } = req.body;

    if (!permissionType || !description) {
        throw new ApiError(400, 'All fields (permissionType, description) are required');
    }

    const existingPermission = await Permission.findOne({ permissionType });
    if (existingPermission) {
        throw new ApiError(400, `Permission '${permissionType}' already exists`);
    }
    const newPermission = await Permission.create({
        permissionType,
        description,
        adminId : req.user._id
    });
    res.status(201).json(new ApiResponse(201, newPermission, 'Permission created successfully'));
});

export const getPermissionById = asyncHandler(async (req, res) => {
    const permissionId = req.params.id;

    if (!permissionId) {
        throw new ApiError(400, "permission ID is required");
    }

    const permission = await Permission.findById(permissionId).populate('adminId');
    if (!permission) {
        throw new ApiError(404, `Permission with ID '${permissionId}' not found`);
    }

    res.status(200).json(new ApiResponse(200, permission, `Permission with ID '${permissionId}' fetched successfully`));
});

export const updatePermission = asyncHandler(async (req, res) => {
    const permissionId = req.params.id;

    if (!permissionId) {
        throw new ApiError(400, "permission ID is required");
    }
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(400, 'All fields (name, description) are required');
    }

    let permission = await Permission.findById(permissionId);
    if (!permission) {
        throw new ApiError(404, `Permission with ID '${permissionId}' not found`);
    }

    permission.name = name;
    permission.description = description;

    await permission.save();

    res.status(200).json(new ApiResponse(200, permission, `Permission with ID '${permissionId}' updated successfully`));
});

export const deletePermission = asyncHandler(async (req, res) => {
    const permissionId = req.params.id;
    if (!permissionId) {
        throw new ApiError(400, "permission Id is required");
    }

    const permission = await Permission.findByIdAndDelete(permissionId);
    if (!permission) {
        throw new ApiError(404, `Permission with ID '${permissionId}' not found`);
    }

    res.status(200).json(new ApiResponse(200, null, `Permission with ID '${permissionId}' deleted successfully`));
});

export const getAllPermissions = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;

    const totalPermissions = await Permission.countDocuments();
    const permissions = await Permission.find().populate('adminId').skip(startIndex).limit(limit);

    const pageCount = Math.ceil(totalPermissions / limit);

    if (!permissions || permissions.length === 0) {
        throw new ApiError(404, "No permissions found");
    }

    res.status(200).json(new ApiResponse(200, {
        permissions,
        totalCount: totalPermissions,
        limit,
        pageCount,
        currentPage: page
    }, "Permissions fetched successfully"));
});