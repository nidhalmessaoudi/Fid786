import Section from "./Section";

export default class RewardSection extends Section {
  constructor() {
    super(
      "REWARD",
      `
        <section class="dashboard-section" id="reward">
            <div class="dashboard-section__top">
                <h2 class="dashboard-section__title">Manage Rewards</h2>
                <button class="btn btn-primary" id="newREWARD">New Reward</button>
            </div>
            <div class="dashboard-section__overview"><em>(Total: 12)</em></div>
            <div class="dashboard-section__cards">
                <div class="dashboard-section__card">
                    Test1
                </div>
                <div class="dashboard-section__card">
                    Test2
                </div>
                <div class="dashboard-section__card">
                    Test3
                </div>
                <div class="dashboard-section__card">
                    Test4
                </div>
            </div>
        </section>
    `
    );
  }
}
