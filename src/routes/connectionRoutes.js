const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const {
  sendRequest,
  updateRequest,
  getAllRequests,
  getAllSendRequests,
  getAllFriends,
  friendsProfile,
  blockedUser,
} = require("../controllers/connectionController");
const connectionRouter = express.Router();
connectionRouter.post(
  "/request/send/:status/:toUserId",
  authMiddleware,
  sendRequest
);
connectionRouter.post(
  "/request/update/:status/:id",
  authMiddleware,
  updateRequest
);
connectionRouter.get("/receive-requests", authMiddleware, getAllRequests);
connectionRouter.get("/send-requests", authMiddleware, getAllSendRequests);
connectionRouter.get("/getallfriends", authMiddleware, getAllFriends);
connectionRouter.get("/friendsprofile/:id", authMiddleware, friendsProfile);
connectionRouter.post("/blockeduser/:id", authMiddleware, blockedUser);

module.exports = connectionRouter;
