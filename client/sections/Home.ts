import Section from "./Section";

export default class HomeSection extends Section {
  constructor() {
    super(
      "HOME",
      `
        <section class="dashboard-section" id="home">
            <div class="dashboard-section__top">
                <h2 class="dashboard-section__title">Home</h2>
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
            </div>
        </section>
    `
    );
  }
}
