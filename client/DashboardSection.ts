import ProductModal from "./modals/Product";
import RewardModal from "./modals/Reward";
import StoreModal from "./modals/Store";
import Section from "./types/Section";

export default class DashboardSection {
  private type: Section;
  private sectionContainer: HTMLDivElement;
  private markup = {
    HOME: `
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
    `,
    STORE: `
            <section class="dashboard-section" id="stores">
                <div class="dashboard-section__top">
                    <h2 class="dashboard-section__title">Manage Stores</h2>
                    <button class="btn btn-primary" id="newSTORE">New Store</button>
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
        `,
    PRODUCT: `
            <section class="dashboard-section" id="products">
                <div class="dashboard-section__top">
                    <h2 class="dashboard-section__title">Manage Products</h2>
                    <button class="btn btn-primary" id="newPRODUCT">New Product</button>
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
        `,
    REWARD: `
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
        `,
    ORDER: `
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
        `,
  };

  constructor(type: Section) {
    this.type = type;
    this.sectionContainer = document.getElementById(
      "dashboardContent"
    ) as HTMLDivElement;
    this.sectionContainer.innerHTML = this.markup[type];

    if (type !== "HOME" && type !== "ORDER") {
      document
        .getElementById(`new${type}`)
        ?.addEventListener("click", this.renderModalHandler.bind(this));
    }
  }

  private renderModalHandler() {
    switch (this.type) {
      case "STORE":
        new StoreModal();
        break;
      case "PRODUCT":
        new ProductModal();
        break;
      case "REWARD":
        new RewardModal();
        break;
    }
  }
}
