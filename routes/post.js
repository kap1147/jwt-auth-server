const router = require("express").Router();
const Middleware = require("../middlewares");
const PostController = require("../controllers/PostController");
const {upload} = require('../utils/aws-multer-upload')

router.post("/", Middleware.checkAuth, upload.array('images', 5), PostController.addPost);
router.delete("/", Middleware.checkAuth, PostController.deletePost);
router.get("/search", PostController.getAllPost);
router.post("/home", PostController.getAllPostHome);
router.get("/user", Middleware.checkAuth, PostController.getUserPost);
router.get("/:id", PostController.getPost);
router.post("/:id/bid", Middleware.checkAuth, PostController.openBid);
router.delete("/:id/bid", Middleware.checkAuth, PostController.deleteBid);

module.exports = router;
