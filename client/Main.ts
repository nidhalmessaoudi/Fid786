import Section from "./types/Section";
import HomeSection from "./sections/Home";
import OrderSection from "./sections/Order";
import ProductSection from "./sections/Product";
import RewardSection from "./sections/Reward";
import StoreSection from "./sections/Store";

export default class Main {
  public static self: Main;
  private focusedEl?: HTMLElement;

  private constructor() {
    if (location.pathname !== "/dashboard") {
      return;
    }
    this.renderDashboard();

    const userDropdownToggle = document.getElementById(
      "dropdownToggle"
    )! as HTMLSpanElement;
    userDropdownToggle.addEventListener(
      "click",
      this.dropdownToggleHandler.bind(this)
    );

    const sidebarItemsContainer = document.getElementById(
      "sidebarItems"
    )! as HTMLDivElement;
    sidebarItemsContainer.addEventListener(
      "click",
      this.sidebarClickHandler.bind(this)
    );
  }

  static main() {
    this.self = new Main();
    return this.self;
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

  private dropdownToggleHandler() {
    if (this.focusedEl) {
      return;
    }

    const userDropdownTemplate = document.getElementById(
      "userDropdownTemplate"
    )! as HTMLTemplateElement;

    userDropdownTemplate.parentElement?.appendChild(
      userDropdownTemplate.content.cloneNode(true) as HTMLElement
    );

    this.focusedEl = document.getElementById("userDropdown")!;

    setTimeout(() => this.attachListenerToBody(), 50);
  }

  private attachListenerToBody() {
    document.body.addEventListener(
      "click",
      this.closeFocusedHandler.bind(this),
      { once: true }
    );
  }

  private closeFocusedHandler(e: Event) {
    const target = e.target as HTMLElement;

    if (target.closest(`#${this.focusedEl!.id}`)) {
      this.attachListenerToBody();
      return;
    }

    this.focusedEl!.remove();
    this.focusedEl = undefined;
  }

  private sidebarClickHandler(e: Event) {
    let target = e.target as HTMLElement;

    if (!target.classList.contains("sidebar-item")) {
      target = target.closest(".sidebar-item") as HTMLElement;
      if (!target) return;
    }

    const sectionDataset = target.dataset.section as Section | "NULL";

    if (sectionDataset === "NULL") {
      return;
    }

    this.renderDashboard(sectionDataset);
  }
}
