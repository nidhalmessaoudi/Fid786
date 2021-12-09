import ProductModal from "../modals/Product";
import RewardModal from "../modals/Reward";
import StoreModal from "../modals/Store";
import TypeSection from "../types/Section";

export default class Section {
  private sectionContainer: HTMLDivElement;
  private loadingSpinner = `
    <div class="loading-spinner__dashboard"><div class="loading-spinner"></div></div>
  `;

  constructor(private type: TypeSection) {
    this.sectionContainer = document.getElementById(
      "dashboardContent"
    ) as HTMLDivElement;
    this.sectionContainer.innerHTML = this.loadingSpinner;
  }

  protected render(markup: string) {
    this.sectionContainer.innerHTML = markup;

    if (this.type !== "HOME" && this.type !== "ORDER") {
      document
        .getElementById(`new${this.type}`)
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
