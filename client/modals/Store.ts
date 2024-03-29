import axios from "axios";
import validator from "validator";

import Modal from "./Modal";
import Store from "../types/Store";

export default class StoreModal extends Modal {
  constructor(reloadFn: Function, storeId?: string) {
    super("New Store", storeId ? "EDITABLE" : "CREATABLE", reloadFn);

    this.load(storeId).then(() => {
      this.form = document.querySelector(".modal-form") as HTMLFormElement;

      this.form.addEventListener("submit", this.submitHandler.bind(this));
    });
  }

  protected async load(storeId?: string) {
    try {
      let buttons;
      let nameValue;
      let locationValue;
      let pathValue;
      let logoValue;
      if (storeId) {
        buttons = `
        <button type="submit" class="btn btn-primary">Edit</button>
        <button type="button" id="deleteDoc" class="btn btn-danger">Delete</button>
      `;
        const { data } = await axios({
          url: `/api/v1/stores/${storeId}`,
          method: "GET",
        });

        const doc = data.doc as Store;

        nameValue = doc.name;
        locationValue = doc.location;
        pathValue = doc.subUrl;
        logoValue = doc.logo;
      } else {
        buttons = `<button type="submit" class="btn btn-primary">Submit</button>`;
      }

      this.render(`
      <form class="modal-form" data-id="${storeId || ""}">
          <div class="form-control">
              <label>Store Name *</label>
              <input type="text" name="name" value="${
                nameValue || ""
              }" placeholder="Put the name here..." required>
          </div>
          <div class="form-control">
              <label>Store Location *</label>
              <input type="text" name="location" value="${
                locationValue || ""
              }" placeholder="Put the location here..." required>
          </div>
          <div class="form-control">
              <label>Store Url *</label>
              <div class="input-group">
                  <input type="text" class="inline-first" value="https://fid786.com/stores/" required disabled>
                  <input type="text" name="path" value="${
                    pathValue || ""
                  }" class="inline-second" placeholder="Put the path here...">
              </div>
          </div>
          <div class="form-control">
              <label>Store Logo *</label>
              <input type="text" name="logo" value="${
                logoValue || ""
              }" placeholder="Put the logo url here..." required>
          </div>
          <div class="form-submit">
              ${buttons}
          </div>
      </form>
    `);
    } catch (err) {
      console.error(err);
    }
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

      if (!this.validateForm(pathInput)) {
        return;
      }

      submitBtn.textContent = "Submitting";
      submitBtn.disabled = true;

      const storeId = this.form?.dataset.id;
      await axios({
        url: storeId ? `/api/v1/stores/${storeId}` : "/api/v1/stores",
        method: storeId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        data: {
          name: nameInput.value,
          location: locationInput.value,
          subUrl: pathInput.value,
          logo: logoInput.value,
        },
      });

      this.closeHandler();
    } catch (err) {
      console.log(err);
      this.closeHandler();
    }
  }

  protected override async deleteDoc() {
    await axios({
      url: `/api/v1/stores/${this.form?.dataset.id}`,
      method: "DELETE",
    });
  }

  private validateForm(pathInput: HTMLInputElement) {
    if (this.renderedError) {
      return false;
    }

    if (!validator.isAlphanumeric(pathInput.value)) {
      this.renderedError = this.createError(
        "The url path must be alphanumeric."
      );
      pathInput.parentElement?.parentElement?.appendChild(this.renderedError);

      pathInput.addEventListener(
        "focus",
        this.pathInputFocusHandler.bind(this)
      );
      return false;
    }

    return true;
  }

  private pathInputFocusHandler() {
    if (!this.renderedError) {
      return;
    }

    this.renderedError.remove();
    this.renderedError = undefined;
  }
}
