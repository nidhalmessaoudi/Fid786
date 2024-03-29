import axios from "axios";

import Section from "./Section";
import Store from "../types/Store";
import formatDate from "../helpers/formatDate";

export default class StoreSection extends Section {
  constructor() {
    super("STORE", () => new StoreSection());

    axios({
      url: "/api/v1/stores",
      method: "GET",
    })
      .then((res) => {
        const data = res.data.data as [Store];

        this.render(
          `
            <section class="dashboard-section" id="stores">
                <div class="dashboard-section__top">
                    <h2 class="dashboard-section__title">Manage Stores</h2>
                    <button class="btn btn-primary" id="newSTORE">New Store</button>
                </div>
                <div class="dashboard-section__overview"><em>(Total: ${
                  data.length
                })</em></div>
                <div class="dashboard-section__cards">
                    ${this.renderStore(data)}
                </div>
            </section>
          `
        );
      })
      .catch((err) => {
        console.error(err);
      });
  }

  private renderStore(data: [Store]) {
    const stores = data.map((store) => {
      const date = formatDate(store.createdAt);

      return `
            <a href="/stores/${store.subUrl}" target="_blank" rel="noopener noreferrer">
              <div data-id="${store._id}" data-type="STORE" class="dashboard-section__card store-card">
                  <div class="store-card__top">
                      <div class="store-card__info">
                          <span class="store-card__title">${store.name}</span>
                          <span class="store-card__location">${store.location}</span>
                          ·
                          <span class="store-card__date">${date}</span>
                      </div>
                      <div class="store-card__actions">
                          <button class="btn btn-primary card-btn">Actions</button>
                      </div>
                  </div>
                  <div class="store-card__logo">
                      <img class="store-card__img" src="${store.logo}">
                  </div>
              </div>
            </a>
        `;
    });

    for (let i = 0; i <= stores.length % 3; i++) {
      stores.push(`<div class="wrapper"></div>`);
    }

    return stores.join("");
  }
}
