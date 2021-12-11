import axios from "axios";

import Modal from "./Modal";
import Reward from "../types/Reward";
import Product from "../types/Product";

export default class RewardModal extends Modal {
  private select!: HTMLSelectElement;

  constructor(rewardId?: string) {
    super("New Reward", rewardId ? "EDITABLE" : "CREATABLE");

    this.render(rewardId)
      .then(() => {
        this.form = document.querySelector(".modal-form") as HTMLFormElement;
        this.select = document.getElementById(
          "productSelect"
        ) as HTMLSelectElement;

        this.selectChangeHandler();

        this.select.addEventListener(
          "change",
          this.selectChangeHandler.bind(this)
        );
        this.form.addEventListener("submit", this.submitHandler.bind(this));
      })
      .catch((_) => {
        return;
      });
  }

  private async render(rewardId?: string) {
    try {
      let buttons;
      let productValue = "";
      let fidPointsValue = 0;
      if (rewardId) {
        buttons = `
        <button type="submit" class="btn btn-primary">Edit</button>
        <button type="button" id="deleteDoc" class="btn btn-danger">Delete</button>
      `;
        const { data } = await axios({
          url: `/api/v1/rewards/${rewardId}`,
          method: "GET",
        });

        const doc = data.doc as Reward;

        productValue = doc.product._id;
        fidPointsValue = doc.requiredPoints;
      } else {
        buttons = `<button type="submit" class="btn btn-primary">Submit</button>`;
      }

      const productsRes = await axios({
        url: "/api/v1/products",
        method: "GET",
        params: {
          all: true,
        },
      });

      const productsData = productsRes.data.data as [Product];

      if (!productsData.length) {
        this.renderForm(
          `
            <div class="modal-error">
              <h3>No product was created!</h3>
              <em>(Please create a product first)</em>
            </div>
          `
        );
        throw new Error("CANCEL");
      }

      this.renderForm(`
        <form class="modal-form" data-id="${rewardId || ""}">
          <div class="form-control">
              <label>Product To Be Rewarded</label>
              <select name="product" id="productSelect">
                ${productsData
                  ?.map((product) => {
                    return `
                    <option
                    data-id="${product._id}"
                    value="${product.name}"
                    ${product._id === productValue ? "selected" : ""}>
                      ${product.name}
                    </option>
                  `;
                  })
                  .join("")}
              </select>
          </div>
          <div class="form-control">
              <label>Required Fid Points</label>
              <input 
               type="number"
               name="fidPoints"
               value="${fidPointsValue || ""}"
               placeholder="Put the required fid points here...">
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

      const productInput = this.form!.querySelector(
        `select[name="product"]`
      ) as HTMLInputElement;
      const fidPointsInput = this.form!.querySelector(
        `input[name="fidPoints"]`
      ) as HTMLInputElement;
      const submitBtn = this.form!.querySelector(
        `button[type="submit"]`
      )! as HTMLButtonElement;

      submitBtn.textContent = "Submitting";
      submitBtn.disabled = true;

      const rewardId = this.form?.dataset.id;

      const res = await axios({
        url:
          this.type === "CREATABLE"
            ? "/api/v1/rewards"
            : `/api/v1/rewards/${rewardId}`,
        method: this.type === "CREATABLE" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        data: {
          product: productInput.dataset.id,
          requiredPoints: fidPointsInput.value,
        },
      });

      console.log(res);

      this.closeHandler();
    } catch (err) {
      console.log(err);
      this.closeHandler();
    }
  }

  protected override async deleteDoc() {
    await axios({
      url: `/api/v1/rewards/${this.form?.dataset.id}`,
      method: "DELETE",
    });
  }
}
