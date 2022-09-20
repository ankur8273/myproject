const express=require("express");
const router=express.Router();
const matchcontroller=require("../controllers/matchcontroller.js");

router.post("/roomcreate",matchcontroller.matchStart);
router.post("/getlastroomId",matchcontroller.getlastroomId);
router.post("/matchStartStatusUpdate",matchcontroller.matchStartStatusUpdate);
router.get("/getpublicurl",matchcontroller.getprofile);
router.get("/leaderboard",matchcontroller.LeaderBoard);
router.post("/Bet_List_create",matchcontroller.Bet_List_create);
router.post("/Bet_deduction_create",matchcontroller.Bet_deduction_create);
router.post("/bet_list_all",matchcontroller.bet_list_all);

module.exports=router;

