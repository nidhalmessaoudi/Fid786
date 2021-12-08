import axios from "axios";

import Modal from "./Modal";

export default class RewardModal extends Modal {
  private select: HTMLSelectElement;
  constructor() {
    super(
      "New Reward",
      `
        <form class="modal-form">
            <div class="form-control">
                <label>Product To Be Rewarded</label>
                <select name="product" id="productSelect">
                    <option data-id="61aa419be68c3a176b8f4f89" value="Test">Test</option>
                    <option data-id="61aa419be68c3a176b8f4f89" value="Test">Test</option>
                    <option data-id="61aa419be68c3a176b8f4f89" value="Test">Test</option>
                    <option data-id="61aa419be68c3a176b8f4f89" value="Test">Test</option>
                </select>
            </div>
            <div class="form-control">
                <label>Required Fid Points</label>
                <input type="number" name="fidPoints" placeholder="Put the required fid points here...">
            </div>
            <div class="form-submit">
                <button type="submit" class="btn btn-primary">Submit</button>
            </div>
        </form>
    `
    );
    this.form = document.querySelector(".modal-form") as HTMLFormElement;
    this.select = document.getElementById("productSelect") as HTMLSelectElement;

    this.select.addEventListener("change", this.selectChangeHandler.bind(this));
    this.form.addEventListener("submit", this.submitHandler.bind(this));
  }

  private selectChangeHandler() {
    this.select.dataset.id =
      this.select.options[this.select.selectedIndex].dataset.id;
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

      const res = await axios({
        url: "/api/v1/rewards",
        method: "POST",
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
}
