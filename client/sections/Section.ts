import ProductModal from "../modals/Product";
import RewardModal from "../modals/Reward";
import StoreModal from "../modals/Store";
import TypeSection from "../types/Section";

export default class Section {
  private sectionContainer: HTMLDivElement;
  private loadingSpinner = `
    <div class="loading-spinner__dashboard"><div class="loading-spinner"></div></div>
  `;
  protected cardsContainer!: HTMLDivElement;

  constructor(private type: TypeSection) {
    this.sectionContainer = document.getElementById(
      "dashboardContent"
    ) as HTMLDivElement;
    this.sectionContainer.innerHTML = this.loadingSpinner;
  }

  protected render(markup: string) {
    this.sectionContainer.innerHTML = markup;

    this.cardsContainer = document.querySelector(
      ".dashboard-section__cards"
    ) as HTMLDivElement;

    this.cardsContainer?.addEventListener(
      "click",
      this.cardClickHandler.bind(this)
    );

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

  protected cardClickHandler(e: Event) {
    const target = e.target as HTMLElement;

    if (!target.classList.contains("card-btn")) {
      return;
    }

    e.preventDefault();

    const card = target.closest(".dashboard-section__card") as HTMLDivElement;

    switch (card?.dataset.type) {
      case "STORE":
        new StoreModal(card?.dataset.id);
        break;
      case "PRODUCT":
        new ProductModal(card?.dataset.id);
        break;
    }
  }
}
