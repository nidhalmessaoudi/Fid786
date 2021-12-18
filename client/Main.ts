import Dashboard from "./Dashboard";
import OrderProductModal from "./modals/OrderProduct";

export default class Main {
  public static self: Main;
  private focusedEl?: HTMLElement;

  private constructor() {
    document
      .getElementById("dropdownToggle")
      ?.addEventListener("click", this.dropdownToggleHandler.bind(this));

    if (location.pathname === "/dashboard") {
      new Dashboard();
      return;
    }

    if (location.pathname === "/") {
      document
        .getElementById("contactForm")
        ?.addEventListener("submit", this.contactSubmitHandler.bind(this));
      return;
    }

    document
      .getElementById("productImgs")
      ?.addEventListener("click", this.changeActiveImgHandler.bind(this));

    document
      .getElementById("orderProduct")
      ?.addEventListener("submit", this.orderProductHandler.bind(this));
  }

  static main() {
    this.self = new Main();
    return this.self;
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

  private changeActiveImgHandler(e: Event) {
    const target = e.target as HTMLImageElement;

    if (!target.src) {
      return;
    }

    const activeImgContainer = document.getElementById(
      "productActiveImg"
    ) as HTMLImageElement;

    if (target.src === activeImgContainer.src) {
      return;
    }

    activeImgContainer.innerHTML = target.outerHTML;
  }

  private orderProductHandler(e: Event) {
    e.preventDefault();

    const target = e.target as HTMLFormElement;

    const productId = target.dataset?.id;
    const orderType = target.dataset?.type;
    const loggedIn = Boolean(target.dataset?.loggedIn);
    const quantityInput = target?.querySelector(
      "input[id='orderAmount']"
    ) as HTMLInputElement;

    if (!loggedIn) {
      location.href = "/login";
      return;
    }

    new OrderProductModal(
      orderType!,
      productId!,
      +quantityInput?.value.trim() || 1
    );
  }

  private contactSubmitHandler(e: Event) {
    e.preventDefault();

    const contactName = document.getElementById(
      "contactName"
    ) as HTMLInputElement;
    const contactEmail = document.getElementById(
      "contactEmail"
    ) as HTMLInputElement;
    const contactSubject = document.getElementById(
      "contactSubject"
    ) as HTMLInputElement;
    const contactMessage = document.getElementById(
      "contactMessage"
    ) as HTMLInputElement;

    const email = contactEmail.value;
    const subject = contactSubject.value;
    const body = contactMessage.value;

    const url = `mailto:gafouri@gmail.com?bcc=${email}&subject=${subject}&body=${body}`;
    window.open(url);

    contactName.value = "";
    contactEmail.value = "";
    contactSubject.value = "";
    contactMessage.value = "";
  }
}
