const express=require("express");
const router=express.Router();
const matchcontroller=require("../controllers/matchcontroller.js");

router.post("/roomcreate",matchcontroller.matchStart);
router.post("/getlastroomId",matchcontroller.getlastroomId);
router.post("/matchStartStatusUpdate",matchcontroller.matchStartStatusUpdate);
router.get("/getpublicurl",matchcontroller.getprofile);
router.get("/leaderboard",matchcontroller.LeaderBoard);

module.exports=router;

