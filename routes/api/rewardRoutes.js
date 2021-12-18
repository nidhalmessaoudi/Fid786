const router = require("express").Router();

const rewardController = require("../../controllers/rewardController");
const { apiCheckIfAuthenticated } = require("../../controllers/authController");

router.use(apiCheckIfAuthenticated);

router
  .route("/")
  .get(rewardController.getRewards)
  .post(
    rewardController.attachStoreToReward,
    rewardController.checkProductOwnership,
    rewardController.createReward
  );

router
  .route("/:id")
  .get(rewardController.getReward)
  .patch(rewardController.checkOwnership, rewardController.updateReward)
  .delete(rewardController.checkOwnership, rewardController.deleteReward);

module.exports = router;
