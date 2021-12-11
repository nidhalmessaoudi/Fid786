import axios from "axios";
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
              <div class="order-cards">
                ${this.renderOrder(data)}
              </div>
          </section>
      `
      );
    });
  }

  private renderOrder(data: [Order]) {
    const orders = data.map((order) => {
      return `
            <div class="order-card" data-id="${order._id}">
                <div>
                    <i class="bi bi-person-circle"></i>
                    <span>${order.buyer.username}</span>
                </div>
                <div>
                    <span>${order.product.name}</span>
                    ·
                    <span>${order.createdAt}</span>
                </div>
                <span>${order.price}</span>
                <span>${order.product.deliveryTime} Days Delivery</span>
                <span class="order-card__${order.state}">${order.state}</span>
            </div>
        `;
    });

    return orders.join("");
  }
}
