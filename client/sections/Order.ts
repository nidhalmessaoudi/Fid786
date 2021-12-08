import Section from "./Section";

export default class OrderSection extends Section {
  constructor() {
    super(
      "ORDER",
      `
        <section class="dashboard-section" id="orders">
            <div class="dashboard-section__top">
                <h2 class="dashboard-section__title">Manage Orders</h2>
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