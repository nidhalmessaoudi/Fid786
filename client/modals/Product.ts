import axios from "axios";

import Modal from "./Modal";

export default class ProductModal extends Modal {
  private select: HTMLSelectElement;
  private photoInputs: HTMLDivElement;
  private photoNumber = 1;

  constructor() {
    super("New Product");
    this.renderForm(`
        <form class="modal-form">
            <div class="form-control">
              <label>Store</label>
                <select id="storeSelect" name="store">
                    <option data-id="619a64b60b0468ff01198150" selected>test1</option>
                    <option data-id="619a64b60b0468ff01198150">test2</option>
                    <option data-id="619a64b60b0468ff01198150">test3</option>
                    <option data-id="619a64b60b0468ff01198150">test4</option>
                </select/>
            </div>
            <div class="form-control">
                <label>Product Name</label>
                <input type="text" name="name" placeholder="Put the name here...">
            </div>
            <div class="form-control">
                <label>Product Description</label>
                <textarea type="text" name="description" rows="6" placeholder="Put the description here..."></textarea>
            </div>
            <div class="form-control">
                <label>Product Photo</label>
                  <div id="photoInputs">
                    <input type="text" name="photo1" placeholder="Put the photo url here...">
                  </div>
                  <button class="btn btn-primary" id="addPhoto">New Photo</button>
            </div>
            <div class="form-control">
                <label>Product Price</label>
                <input type="number" name="price" min="1" placeholder="Put the price with euros here...">
            </div>
            <div class="form-control">
                <label>Product Delivery Time</label>
                <input type="number" name="delivery" min="1" placeholder="Put the delivery time here as number of days...">
            </div>
            <div class="form-control">
                <label>Product Fid Points</label>
                <input type="number" name="fidPoints" placeholder="Put the fid points here...">
            </div>
            <div class="form-submit">
                <button type="submit" class="btn btn-primary">Submit</button>
            </div>
        </form>
    `);
    this.form = document.querySelector(".modal-form") as HTMLFormElement;
    this.select = document.getElementById("storeSelect") as HTMLSelectElement;
    this.photoInputs = document.getElementById("photoInputs") as HTMLDivElement;

    this.select.addEventListener("change", this.selectChangeHandler.bind(this));
    this.form.addEventListener("submit", this.submitHandler.bind(this));
    document
      .getElementById("addPhoto")!
      .addEventListener("click", this.addPhotoHandler.bind(this));
  }

  private selectChangeHandler() {
    this.select.dataset.id =
      this.select.options[this.select.selectedIndex].dataset.id;
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
      const submitBtn = this.form!.querySelector(
        `button[type="submit"]`
      )! as HTMLButtonElement;

      submitBtn.textContent = "Submitting";
      submitBtn.disabled = true;

      const res = await axios({
        url: "/api/v1/products",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: {
          store: storeInput.dataset.id,
          name: nameInput.value,
          description: descriptionInput.value,
          photos: photoInputs.map((input) => input.value),
          price: +priceInput.value,
          deliveryTime: +deliveryInput.value,
          fidPoints: +fidPointsInput.value,
        },
      });

      console.log(res);

      this.closeHandler();
    } catch (err) {
      console.log(err);
      this.closeHandler();
    }
  }

  private addPhotoHandler(e: Event) {
    e.preventDefault();
    const prevInput = this.photoInputs.lastElementChild! as HTMLInputElement;
    console.log(prevInput);
    if (!prevInput.value || !prevInput.value.trim()) {
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
}
