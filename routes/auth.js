const router = require("express").Router();
const AuthController = require("../controllers/AuthController");
const Middleware = require("../middlewares");

//@route POST /api/auth/refresh_token
router.post("/refresh_token", AuthController.generateRefreshToken);

//@route DELETE /api/auth/logout
router.get("/logout", Middleware.checkAuth,  AuthController.logout);

//Redirect to home page if login succeeded or to /auth/login/failed if failed
router.get('/google/callback', AuthController.googleCallback);
//@route GET /api/auth/google log in or sign up user
router.get('/google', AuthController.googleLogin);
//Get access token
router.get('/token', AuthController.getToken);
//Get user
router.get('/user', Middleware.checkAuth, AuthController.getUser);
//@route GET /api/protected_resource
//@access to only authenticated users
router.get("/protected_resource", Middleware.checkAuth, (req, res) => {
  return res.status(200).json({ user: req.user });
});

module.exports = router;
