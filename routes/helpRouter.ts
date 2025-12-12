
import express from "express";
import multer from "multer";
import { isAuthenticated } from "../middleware/isAuthenticated";

import {
    createHelpRequest,
    getAllHelpRequests,
    getHelpRequestById,
    acceptHelpRequest,
    completeHelpRequest,
} from "../controllers/help.controller";

export const helpRequestRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

helpRequestRouter.post(
    "/create",
    isAuthenticated,
    upload.array("files", 4),
    createHelpRequest
);

helpRequestRouter.get(
    "/",
    isAuthenticated,
    getAllHelpRequests
);

helpRequestRouter.get(
    "/:id",
    isAuthenticated,
    getHelpRequestById
);

helpRequestRouter.patch(
    "/accept/:id",
    isAuthenticated,
    acceptHelpRequest
);

helpRequestRouter.patch(
    "/complete/:id",
    isAuthenticated,
    completeHelpRequest
);


