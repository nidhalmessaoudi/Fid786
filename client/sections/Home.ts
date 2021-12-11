import axios from "axios";

import Section from "./Section";

export default class HomeSection extends Section {
  constructor() {
    super("HOME");

    axios({
      url: "/api/v1/overview",
      method: "GET",
    })
      .then((res) => {
        const data = res.data.data;
        this.render(
          `
              <section class="dashboard-section" id="home">
                  <div class="dashboard-section__top">
                      <h2 class="dashboard-section__title">Home</h2>
                  </div>
                  <div class="dashboard-section__cards">
                      <div class="dashboard-section__card home-card card-red">
                          <h3 class="home-card__title">Total Stores</h3>
                          <p class="home-card__content">${data.numberOfStores}</p>
                      </div>
                      <div class="dashboard-section__card home-card card-blue">
                          <h3 class="home-card__title">Total Products</h3>
                          <p class="home-card__content">${data.numberOfProducts}</p>
                      </div>
                      <div class="dashboard-section__card home-card card-yellow">
                          <h3 class="home-card__title">Total Orders</h3>
                          <p class="home-card__content">${data.numberOfOrders}</p>
                      </div>
                  </div>
              </section>
          `
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
