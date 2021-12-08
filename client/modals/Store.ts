// import isAlphanumeric from "../helpers/isAlphanumeric";
// import isImageUrl from "../helpers/isImageUrl";
import axios from "axios";

import Modal from "./Modal";

export default class StoreModal extends Modal {
  constructor() {
    super(
      "New Store",
      `
        <form class="modal-form">
            <div class="form-control">
                <label>Store Name *</label>
                <input type="text" name="name" placeholder="Put the name here..." required>
            </div>
            <div class="form-control">
                <label>Store Location *</label>
                <input type="text" name="location" placeholder="Put the location here..." required>
            </div>
            <div class="form-control">
                <label>Store Url *</label>
                <div class="input-group">
                    <input type="text" class="inline-first" value="https://fid786.com/" required disabled>
                    <input type="text" name="path" class="inline-second" placeholder="Put the path here...">
                </div>
            </div>
            <div class="form-control">
                <label>Store Logo *</label>
                <input type="text" name="logo" placeholder="Put the logo url here..." required>
            </div>
            <div class="form-submit">
                <button type="submit" class="btn btn-primary">Submit</button>
            </div>
        </form>
    `
    );

    this.form = document.querySelector(".modal-form") as HTMLFormElement;
    this.form.addEventListener("submit", this.submitHandler.bind(this));
  }

  private async submitHandler(e: Event) {
    try {
      e.preventDefault();

      const nameInput = this.form!.querySelector(
        `input[name="name"]`
      ) as HTMLInputElement;
      const locationInput = this.form!.querySelector(
        `input[name="location"]`
      ) as HTMLInputElement;
      const pathInput = this.form!.querySelector(
        `input[name="path"]`
      ) as HTMLInputElement;
      const logoInput = this.form!.querySelector(
        `input[name="logo"]`
      ) as HTMLInputElement;
      const submitBtn = this.form!.querySelector(
        `button[type="submit"]`
      )! as HTMLButtonElement;

      submitBtn.textContent = "Submitting";
      submitBtn.disabled = true;

      const res = await axios({
        url: "/api/v1/stores",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: {
          name: nameInput.value,
          location: locationInput.value,
          subUrl: pathInput.value,
          logo: logoInput.value,
        },
      });

      console.log(res);

      this.closeHandler();
    } catch (err) {
      console.log(err);
      this.closeHandler();
    }
  }

  //   private validateForm(inputs: any) {
  //     if (!isAlphanumeric(inputs.pathInput.value)) {
  //         this.removePrevError();
  //         this.renderedError = this.createError(
  //           "The url path must be alphanumeric."
  //         );
  //         inputs.pathInput.parentElement?.parentElement?.appendChild(this.renderedError);
  //         inputs.pathInput.style.borderColor = "red";
  //         return;
  //       }

  //       if (!isImageUrl(inputs.logoInput.value)) {
  //         this.removePrevError();
  //         this.renderedError = this.createError("Invalid logo url.");
  //         inputs.logoInput.parentElement?.parentElement?.appendChild(this.renderedError);
  //         inputs.logoInput.style.borderColor = "red";
  //         return;
  //       }
  //   }
}
