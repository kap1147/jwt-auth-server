const router = require("express").Router();
const ChatController = require("../controllers/ChatController");
const Middleware = require("../middlewares");
/////ROUTES/////
router.post('/', Middleware.checkAuth, ChatController.getChatId);

module.exports = router;
