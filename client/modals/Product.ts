import axios from "axios";

import Modal from "./Modal";
import Store from "../types/Store";
import Product from "../types/Product";

export default class ProductModal extends Modal {
  private select!: HTMLSelectElement;
  private photoInputs!: HTMLDivElement;
  private photoNumber = 1;

  constructor(productId?: string) {
    super("New Product", productId ? "EDITABLE" : "CREATABLE");

    this.render(productId)
      .then(() => {
        this.form = document.querySelector(".modal-form") as HTMLFormElement;
        this.select = document.getElementById(
          "storeSelect"
        ) as HTMLSelectElement;
        this.photoInputs = document.getElementById(
          "photoInputs"
        ) as HTMLDivElement;

        this.selectChangeHandler();

        this.select.addEventListener(
          "change",
          this.selectChangeHandler.bind(this)
        );
        this.form.addEventListener("submit", this.submitHandler.bind(this));
        document
          .getElementById("addPhoto")!
          .addEventListener("click", this.addPhotoHandler.bind(this));
      })
      .catch((_) => {
        return;
      });
  }

  private async render(productId?: string) {
    try {
      let buttons;
      let storeValue = "";
      let nameValue = "";
      let descriptionValue = "";
      let photosValue = [""];
      let priceValue = 0;
      let deliveryValue = 0;
      let availabilityValue = "";
      let fidPointsValue = 0;
      if (productId) {
        buttons = `
        <button type="submit" class="btn btn-primary">Edit</button>
        <button type="button" id="deleteDoc" class="btn btn-danger">Delete</button>
      `;
        const { data } = await axios({
          url: `/api/v1/products/${productId}`,
          method: "GET",
        });

        const doc = data.doc as Product;

        storeValue = doc.store._id;
        nameValue = doc.name;
        descriptionValue = doc.description;
        photosValue = doc.photos;
        priceValue = doc.price;
        deliveryValue = doc.deliveryTime;
        availabilityValue = doc.availability;
        fidPointsValue = doc.fidPoints;
      } else {
        buttons = `<button type="submit" class="btn btn-primary">Submit</button>`;
      }

      const storesRes = await axios({
        url: "/api/v1/stores",
        method: "GET",
        params: {
          all: true,
        },
      });

      const storesData = storesRes.data.data as [Store];

      if (!storesData.length) {
        this.renderForm(
          `
            <div class="modal-error">
              <h3>No store was created!</h3>
              <em>(Please create a store first)</em>
            </div>
          `
        );
        throw new Error("CANCEL");
      }

      this.renderForm(`
        <form class="modal-form" data-id="${productId || ""}">
          <div class="form-control">
            <label>Store</label>
              <select id="storeSelect" name="store">
                ${storesData
                  ?.map((store) => {
                    return `
                    <option
                    data-id="${store._id}"
                    value="${store.name}"
                    ${store._id === storeValue ? "selected" : ""}>
                      ${store.name}
                    </option>
                  `;
                  })
                  .join("")}
              </select>
          </div>
          <div class="form-control">
              <label>Product Name</label>
              <input type="text" name="name" value="${
                nameValue || ""
              }" placeholder="Put the name here...">
          </div>
          <div class="form-control">
              <label>Product Description</label>
              <textarea 
               type="text"
               name="description"
               rows="6"
               placeholder="Put the description here..."
              >${descriptionValue || ""}</textarea>
          </div>
          <div class="form-control">
              <label>Product Photo</label>
                <div id="photoInputs">
                  ${
                    photosValue
                      .map((photoValue, i) => {
                        return `
                      <input 
                      type="text"
                      value="${photoValue}"
                      name="photo${i + 1}"
                      placeholder="Put the photo url here..."
                      ${i === 0 ? "required" : ""}
                      >
                    `;
                      })
                      .join("") ||
                    `<input 
                    type="text"
                    name="photo1"
                    placeholder="Put the photo url here..."
                    >`
                  }
                </div>
                <button class="btn btn-primary" id="addPhoto">New Photo</button>
          </div>
          <div class="form-control">
              <label>Product Price</label>
              <input
               type="number"
               name="price"
               value="${priceValue}"
               step=".01"
               min="1"
               placeholder="Put the price with euros here..."
              >
          </div>
          <div class="form-control">
              <label>Product Delivery Time</label>
              <input
               type="number"
               name="delivery"
               value="${deliveryValue}"
               min="1"
               placeholder="Put the delivery time here as number of days..."
              >
          </div>
          <div id="availabilityCheck" class="form-control">
              <label>Availability</label>
              <div>
                <input type="radio" id="inStock" name="availability" value="In Stock" ${
                  availabilityValue === "Out of Stock" ? "" : "checked"
                }>
                <label class="radio-label" for="inStock">In Stock</label>
              </div>
              <div>
                <input type="radio" id="outOfStock" name="availability" value="Out of Stock" ${
                  availabilityValue === "Out of Stock" ? "checked" : ""
                }>
                <label class="radio-label" for="outOfStock">Out of Stock</label>
              </div>
          </div>
          <div class="form-control">
              <label>Product Fid Points</label>
              <input type="number" name="fidPoints" value="${
                fidPointsValue || ""
              }" placeholder="Put the fid points here...">
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

  private selectChangeHandler() {
    let selectedOption = this.select.options[this.select.selectedIndex];
    if (!selectedOption) {
      this.select.options[0].selected = true;
      selectedOption = this.select.options[0];
    }
    this.select.dataset.id = selectedOption.dataset.id;
  }

  private async submitHandler(e: Event) {
    try {
      e.preventDefault();

      const storeInput = this.form!.querySelector(
        `select[name="store"]`
      ) as HTMLInputElement;
      const nameInput = this.form!.querySelector(
        `input[name="name"]`
      ) as HTMLInputElement;
      const descriptionInput = this.form!.querySelector(
        `textarea[name="description"]`
      ) as HTMLInputElement;
      const photoInputs = Array.from(
        this.photoInputs.querySelectorAll("input")
      );
      const priceInput = this.form!.querySelector(
        `input[name="price"]`
      ) as HTMLInputElement;
      const deliveryInput = this.form!.querySelector(
        `input[name="delivery"]`
      ) as HTMLInputElement;
      const fidPointsInput = this.form!.querySelector(
        `input[name="fidPoints"]`
      ) as HTMLInputElement;
      const inStockInput = this.form!.querySelector(
        `input[id="inStock"]`
      ) as HTMLInputElement;
      const submitBtn = this.form!.querySelector(
        `button[type="submit"]`
      )! as HTMLButtonElement;

      submitBtn.textContent = "Submitting";
      submitBtn.disabled = true;

      const productId = this.form?.dataset.id;
      await axios({
        url:
          this.type === "CREATABLE"
            ? "/api/v1/products"
            : `/api/v1/products/${productId}`,
        method: this.type === "CREATABLE" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        data: {
          store: storeInput.dataset.id,
          name: nameInput.value,
          description: descriptionInput.value.trim(),
          photos: photoInputs.map((input) => input.value),
          price: +priceInput.value,
          deliveryTime: +deliveryInput.value,
          fidPoints: +fidPointsInput.value,
          availability: inStockInput.checked ? "In Stock" : "Out of Stock",
        },
      });

      this.closeHandler();
    } catch (err) {
      console.log(err);
      this.closeHandler();
    }
  }

  private addPhotoHandler(e: Event) {
    e.preventDefault();
    const prevInput = this.photoInputs.lastElementChild! as HTMLInputElement;
    if (!prevInput?.value || !prevInput?.value.trim()) {
      prevInput.focus();
      return;
    }
    ++this.photoNumber;
    const photoInput = document.createElement("input");
    photoInput.type = "text";
    photoInput.name = `photo${this.photoNumber}`;
    photoInput.placeholder = "Put the photo url here...";

    this.photoInputs.insertAdjacentElement("beforeend", photoInput);
  }

  protected override async deleteDoc() {
    await axios({
      url: `/api/v1/products/${this.form?.dataset.id}`,
      method: "DELETE",
    });
  }
}
