const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const {
  sendRequest,
  updateRequest,
  getAllRequests,
} = require("../controllers/connectionController");
const connectionRouter = express.Router();
connectionRouter.post("/request/send/:status/:id", authMiddleware, sendRequest);
connectionRouter.post(
  "/request/update/:status/:id",
  authMiddleware,
  updateRequest
);
connectionRouter.get("/sent-requests", authMiddleware, getAllRequests);

module.exports = connectionRouter;
