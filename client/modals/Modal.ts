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
  private loadingSpinner = `
    <div class="loading-spinner__modal"><div class="loading-spinner"></div></div>
  `;

  private overlay: HTMLElement;
  private modal: HTMLElement;
  protected modalTitle: HTMLElement;
  private modalClose: HTMLElement;
  protected modalContentContainer: HTMLElement;
  protected form?: HTMLFormElement;
  protected renderedError?: HTMLElement;
  protected activeTimer = 0;

  constructor(
    private title: string,
    protected type: "EDITABLE" | "CREATABLE" = "CREATABLE",
    private reloadFn?: Function
  ) {
    document.body.insertAdjacentHTML("afterbegin", this.overlayMarkup);
    document.body.insertAdjacentHTML("afterbegin", this.modalMarkup);

    this.overlay = document.querySelector(".overlay") as HTMLElement;
    this.modal = document.querySelector(".modal") as HTMLElement;
    this.modalTitle = document.querySelector(".modal-brand") as HTMLElement;
    this.modalClose = document.querySelector(".modal-close") as HTMLElement;
    this.modalContentContainer = document.querySelector(
      ".modal-content"
    ) as HTMLElement;

    this.modalTitle.textContent = this.title;
    this.modalContentContainer.innerHTML = this.loadingSpinner;

    this.modalClose.addEventListener(
      "click",
      this.closeModalHandler.bind(this)
    );
    this.overlay.addEventListener("click", this.closeModalHandler.bind(this));
    document.addEventListener("keydown", this.keydownHandler.bind(this), {
      once: true,
    });
  }

  private closeModalHandler() {
    this.closeHandler();
  }

  private keydownHandler(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      this.closeHandler();
    }
  }

  protected render(markup: string) {
    this.modalContentContainer.innerHTML = markup;
    if (this.type === "EDITABLE") {
      document
        .getElementById("deleteDoc")
        ?.addEventListener("click", this.deleteHandler.bind(this));
    }
  }

  protected closeHandler(reload = true) {
    this.modal.remove();
    this.overlay.remove();

    if (!reload) return;

    if (this.reloadFn) {
      this.reloadFn();
    }
  }

  protected createError(text: string) {
    const errorEl = document.createElement("p");
    errorEl.classList.add("form-error");
    errorEl.textContent = text;
    return errorEl;
  }

  private async deleteHandler(e: Event) {
    try {
      const target = e.target as HTMLButtonElement;

      if (this.activeTimer) {
        clearInterval(this.activeTimer);
        target.textContent = "Delete";
        target.style.opacity = "1";
        this.activeTimer = 0;
        return;
      }

      let timer = 3;
      target.textContent = `Undo... ${timer}`;
      target.style.opacity = "0.7";
      this.activeTimer = window.setInterval(async () => {
        if (timer !== 0) {
          timer--;
          target.textContent = `Undo... ${timer}`;
          return;
        }

        target.textContent = "Deleting";
        target.disabled = true;
        await this.deleteDoc();
        this.closeHandler();
        clearInterval(this.activeTimer);
      }, 1000);
    } catch (err) {
      console.error(err);
    }
  }

  protected async deleteDoc() {}
}
