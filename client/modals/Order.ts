import axios from "axios";

import Modal from "./Modal";
import Order from "../types/Order";
import formatDate from "../helpers/formatDate";

export default class OrderModal extends Modal {
  constructor(orderId: string) {
    super("New Order");

    this.load(orderId)
      .then(() => {
        document
          .getElementById("setAsDelivered")
          ?.addEventListener("click", this.setAsDeliveredHandler.bind(this));
      })
      .catch((_) => {
        return;
      });
  }

  protected async load(orderId: string) {
    try {
      const res = await axios({
        url: `/api/v1/orders/${orderId}`,
        method: "GET",
      });

      const order = res.data.doc as Order;

      this.render(`
        <div class="order-info__group">
            <span class="order-info__group-title">Order ID: </span>
            <span class="order-info__group-detail">${order._id}</span>
        </div>
        <div class="order-info__group">
            <span class="order-info__group-title">Product: </span>
            <span class="order-info__group-detail">${order.product.name}</span>
        </div>
        <div class="order-info__group">
            <span class="order-info__group-title">Amount: </span>
            <span class="order-info__group-detail"> ${
              order.amount === 0
                ? 1
                : `€${order.product.price} &times; ${order.amount}`
            }</span>
        </div>
        <div class="order-info__group">
            <span class="order-info__group-title">Total: </span>
            <span class="order-info__group-detail">
              ${order.totalPrice === 0 ? "FREE" : `€${order.totalPrice}`}
            </span>
        </div>
        <div class="order-info__group">
            <span class="order-info__group-title">Buyer Email: </span>
            <span class="order-info__group-detail">${order.buyer.email}</span>
        </div>
        <div class="order-info__group">
            <span class="order-info__group-title">Delivery Location: </span>
            <span class="order-info__group-detail">${order.buyerLocation}</span>
        </div>
        <div class="order-info__group">
            <span class="order-info__group-title">Delivery Time: </span>
            <span class="order-info__group-detail">${
              order.product.deliveryTime
            } Days</span>
        </div>
        <div class="order-info__group">
            <span class="order-info__group-title">Submitted At: </span>
            <span class="order-info__group-detail">${formatDate(
              order.createdAt
            )}</span>
        </div>
        ${
          order.state === "delivered"
            ? `<div class="order-info__group">
                <span class="order-info__group-title">Status: </span>
                <span class="order-info__group-detail">${
                  order.state
                } at ${formatDate(order.updatedAt)}</span>
            </div>`
            : ""
        }
        ${
          order.state === "pending"
            ? `<div class="order-edit__container">
               <button id="setAsDelivered" data-id="${order._id}" class="btn btn-primary">Set as delivered</button>
            </div>`
            : ""
        }
      `);
    } catch (err) {
      console.error(err);
    }
  }

  private async setAsDeliveredHandler(e: Event) {
    try {
      e.preventDefault();
      const target = e.target as HTMLButtonElement;
      target.textContent = "Setting";
      target.disabled = true;

      const res = await axios({
        url: `/api/v1/orders/${target.dataset.id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        data: {
          state: "delivered",
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
