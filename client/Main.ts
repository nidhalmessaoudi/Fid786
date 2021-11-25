export default class Main {
  public static self: Main;
  private isFocused?: HTMLElement;

  private constructor() {
    const userDropdownToggle = document.getElementById(
      "dropdownToggle"
    ) as HTMLSpanElement;
    userDropdownToggle?.addEventListener("click", this.dropdownToggleHandler);
    document.body.addEventListener("click", this.closeFocusedHandler);
  }

  static main() {
    this.self = new Main();
    return this.self;
  }

  private dropdownToggleHandler() {
    if (this.isFocused) {
      return;
    }

    const userDropdownTemplate = document.getElementById(
      "userDropdownTemplate"
    )! as HTMLTemplateElement;

    this.isFocused = userDropdownTemplate.parentElement?.appendChild(
      userDropdownTemplate.content.cloneNode(true) as HTMLElement
    );
  }

  private closeFocusedHandler(e: Event) {
    const target = e.target as HTMLElement;
    console.log(this.isFocused);

    if (!this.isFocused) {
      return;
    }

    console.log(target.closest(this.isFocused.id));

    if (target.closest(this.isFocused.id)) {
      return;
    }

    this.isFocused.parentElement?.removeChild(this.isFocused);
  }
}
