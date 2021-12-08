export default class Modal {
  private overlayMarkup = `<div class="overlay"></div>`;
  private modalMarkup = `
        <div class="modal-container">
            <div class="modal">
                <div class="modal-top">
                    <h2 class="modal-brand"></h2>
                    <div class="modal-close"><i class="bi bi-x"></i></div>
                </div>
                <div class="modal-content"></div>
            </div>
        </div>
    `;

  private overlay: HTMLElement;
  private modal: HTMLElement;
  protected modalTitle: HTMLElement;
  private modalClose: HTMLElement;
  protected ModalFormContainer: HTMLElement;
  protected form?: HTMLFormElement;
  protected renderedError?: HTMLElement;

  constructor(title: string, formMarkup: string) {
    document.body.insertAdjacentHTML("afterbegin", this.overlayMarkup);
    document.body.insertAdjacentHTML("afterbegin", this.modalMarkup);

    this.overlay = document.querySelector(".overlay") as HTMLElement;
    this.modal = document.querySelector(".modal") as HTMLElement;
    this.modalTitle = document.querySelector(".modal-brand") as HTMLElement;
    this.modalClose = document.querySelector(".modal-close") as HTMLElement;
    this.ModalFormContainer = document.querySelector(
      ".modal-content"
    ) as HTMLElement;

    this.modalTitle.textContent = title;
    this.ModalFormContainer.insertAdjacentHTML("afterbegin", formMarkup);

    this.modalClose.addEventListener("click", this.closeHandler.bind(this));
    this.overlay.addEventListener("click", this.closeHandler.bind(this));
    document.addEventListener("keydown", this.keydownHandler.bind(this), {
      once: true,
    });
  }

  private keydownHandler(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      this.closeHandler();
    }
  }

  protected closeHandler() {
    this.modal.remove();
    this.overlay.remove();
  }

  protected createError(text: string) {
    const errorEl = document.createElement("p");
    errorEl.classList.add("form-error");
    errorEl.textContent = text;
    return errorEl;
  }

  protected removePrevError() {
    if (this.renderedError) {
      this.renderedError.remove();
    }
  }
}
