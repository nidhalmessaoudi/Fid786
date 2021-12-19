import axios from "axios";

import Modal from "./Modal";
import Product from "../types/Product";

export default class OrderProductModal extends Modal {
  private orderTotalEl!: HTMLParagraphElement;
  private price?: number;

  constructor(
    private orderType: string,
    productId: string,
    private quantity: number
  ) {
    super("New Order");

    this.load(productId)
      .then(() => {
        this.orderTotalEl = document.getElementById(
          "orderTotal"
        ) as HTMLParagraphElement;

        document
          .getElementById("modalOrderAmount")
          ?.addEventListener(
            "change",
            this.orderAmountChangeHandler.bind(this)
          );

        this.form = document.getElementById("submitOrder") as HTMLFormElement;

        this.form.addEventListener(
          "submit",
          this.orderSubmitHandler.bind(this)
        );
      })
      .catch((_) => {
        return;
      });
  }

  protected async load(productId: string) {
    try {
      const res = await axios({
        url: `/api/v1/products/${productId}`,
        method: "GET",
      });

      const product = res.data.doc as Product;

      if (this.orderType === "FREE") {
        this.render(`
          <form id="submitOrder" class="order-modal" data-id="${productId}">
            <h3 class="order-modal__title">${product.name}</h3>
            <div class="order-modal__info">
              <span class="order-modal__single-price">FREE</span>
            </div>
            <div class="form-control">
                <label>Delivery Location *</label>
                <input type="text" name="buyerLocation" placeholder="Put your delivery location here..." required>
            </div>
            <div class="form-control order-modal__total">
              <label>Total Price</label>
              <p id="orderTotal">FREE</p>
            </div>
            <button type="submit" class="btn btn-primary">Order Now</button>
          </form>
        `);
        return;
      }

      this.price = product.price;

      this.render(`
        <form id="submitOrder" class="order-modal" data-id="${productId}">
          <h3 class="order-modal__title">${product.name}</h3>
          <div class="order-modal__info">
            <span class="order-modal__single-price">€${product.price}</span>
            <span class="order-modal__single-price">&times;</span>
            <div class="form-control form-control__mini order-modal__amount">
                <label for="orderAmount">Qty:</label>
                <input id="modalOrderAmount" name="orderAmount" type="number" min="1" value="${
                  this.quantity
                }" required>
            </div>
          </div>
          <div class="form-control">
              <label>Delivery Location *</label>
              <input type="text" name="buyerLocation" placeholder="Put your delivery location here..." required>
          </div>
          <div class="form-control order-modal__total">
            <label>Total Price</label>
            <p id="orderTotal">€${product.price * this.quantity}</p>
          </div>
          <button type="submit" class="btn btn-primary">Order Now</button>
        </form>
    `);
    } catch (err) {
      console.error(err);
    }
  }

  private orderAmountChangeHandler(e: Event) {
    if (!this.price) {
      return;
    }

    const target = e.target as HTMLInputElement;
    this.orderTotalEl.textContent = `€${this.price! * +target.value}`;
  }

  private async orderSubmitHandler(e: Event) {
    try {
      e.preventDefault();

      const amountInput = this.form!.querySelector(
        `input[name="orderAmount"]`
      ) as HTMLInputElement;
      const buyerLocationInput = this.form!.querySelector(
        `input[name="buyerLocation"]`
      ) as HTMLInputElement;
      const submitBtn = this.form!.querySelector(
        `button[type="submit"]`
      )! as HTMLButtonElement;

      submitBtn.textContent = "Ordering";
      submitBtn.disabled = true;

      await axios({
        url: `/api/v1/orders${this.orderType === "FREE" ? "?type=free" : ""}`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: {
          product: this.form?.dataset.id,
          buyerLocation: buyerLocationInput.value,
          amount: +amountInput?.value || 0,
          totalPrice:
            (+amountInput?.value && this.price! * +amountInput?.value) || 0,
        },
      });

      this.closeHandler(false);
      location.href = "/orders";
    } catch (err) {
      this.closeHandler();
    }
  }
}
