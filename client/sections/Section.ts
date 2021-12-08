import ProductModal from "../modals/Product";
import RewardModal from "../modals/Reward";
import StoreModal from "../modals/Store";
import TypeSection from "../types/Section";

export default class Section {
  private sectionContainer: HTMLDivElement;

  constructor(private type: TypeSection, markup: string) {
    this.sectionContainer = document.getElementById(
      "dashboardContent"
    ) as HTMLDivElement;

    this.sectionContainer.innerHTML = markup;

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
