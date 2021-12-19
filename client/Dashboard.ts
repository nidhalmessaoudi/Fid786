import Section from "./types/Section";
import HomeSection from "./sections/Home";
import OrderSection from "./sections/Order";
import ProductSection from "./sections/Product";
import RewardSection from "./sections/Reward";
import StoreSection from "./sections/Store";

export default class Dashboard {
  constructor() {
    this.renderDashboard();

    const sidebarItemsContainer = document.getElementById(
      "sidebarItems"
    )! as HTMLDivElement;
    sidebarItemsContainer.addEventListener(
      "click",
      this.sidebarClickHandler.bind(this)
    );
  }

  private renderDashboard(section?: Section) {
    const activeSection = section || "HOME";

    switch (activeSection) {
      case "HOME":
        new HomeSection();
        break;
      case "STORE":
        new StoreSection();
        break;
      case "PRODUCT":
        new ProductSection();
        break;
      case "REWARD":
        new RewardSection();
        break;
      case "ORDER":
        new OrderSection();
        break;
    }

    document.querySelectorAll("[data-section]").forEach((el) => {
      if (!(el instanceof HTMLElement)) return;

      if (
        el.dataset.section !== activeSection &&
        el.classList.contains("sidebar-item__active")
      ) {
        el.classList.remove("sidebar-item__active");
      }

      if (
        el.dataset.section === activeSection &&
        !el.classList.contains("sidebar-item__active")
      ) {
        el.classList.add("sidebar-item__active");
      }
    });
  }

  private sidebarClickHandler(e: Event) {
    let target = e.target as HTMLElement;

    if (!target.classList.contains("sidebar-item")) {
      target = target.closest(".sidebar-item") as HTMLElement;
      if (!target) return;
    }

    const sectionDataset = target.dataset.section as Section | "NULL";

    if (sectionDataset === "NULL") {
      location.href = "/";
      return;
    }

    this.renderDashboard(sectionDataset);
  }
}
