const router = require("express").Router();

const rewardController = require("../../controllers/rewardController");

router
  .route("/")
  .get(rewardController.getRewards)
  .post(rewardController.createReward);

router
  .route("/:id")
  .get(rewardController.getReward)
  .patch(rewardController.updateReward)
  .delete(rewardController.deleteReward);

module.exports = router;
