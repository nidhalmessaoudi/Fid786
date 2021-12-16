import axios from "axios";

import formatDate from "../helpers/formatDate";
import OrderModal from "../modals/Order";
import Order from "../types/Order";

import Section from "./Section";

export default class OrderSection extends Section {
  constructor() {
    super("ORDER");

    axios({
      url: "/api/v1/orders",
      method: "GET",
    }).then((res) => {
      const data = res.data.data as [Order];

      this.render(
        `
          <section class="dashboard-section" id="orders">
              <div class="dashboard-section__top">
                  <h2 class="dashboard-section__title">Manage Orders</h2>
              </div>
              <div class="dashboard-section__overview"><em>(Total: ${
                data.length
              })</em></div>
              <div id="orderCards" class="order-cards">
                ${this.renderOrder(data)}
              </div>
          </section>
      `
      );

      document
        .getElementById("orderCards")
        ?.addEventListener("click", this.orderCardClickHandler.bind(this));
    });
  }

  private renderOrder(data: [Order]) {
    const orders = data.map((order) => {
      const orderDate = formatDate(order.createdAt);

      return `
            <div class="order-card" data-id="${order._id}">
                <div>
                    <i class="bi bi-person-circle"></i>
                    <span>${order.buyer.username}</span>
                </div>
                <div>
                    <span>${order.product.name}</span>
                    ·
                    <span>${orderDate}</span>
                </div>
                <span>€${order.totalPrice}</span>
                <span>${order.product.deliveryTime} Days Delivery</span>
                <span class="order-card__${order.state}">${order.state}</span>
            </div>
        `;
    });

    return orders.join("");
  }

  private orderCardClickHandler(e: Event) {
    const target = e.target as HTMLElement;
    const orderCard = target.closest(".order-card") as HTMLDivElement;
    if (!orderCard) {
      return;
    }

    new OrderModal(orderCard.dataset.id!);
  }
}
