import axios from "axios";

import Section from "./Section";
import Product from "../types/Product";
import formatDate from "../helpers/formatDate";

export default class ProductSection extends Section {
  constructor() {
    super("PRODUCT");

    axios({
      url: "/api/v1/products",
      method: "GET",
    }).then((res) => {
      const data = res.data.data as [Product];

      this.render(
        `
          <section class="dashboard-section" id="products">
              <div class="dashboard-section__top">
                  <h2 class="dashboard-section__title">Manage Products</h2>
                  <button class="btn btn-primary" id="newPRODUCT">New Product</button>
              </div>
              <div class="dashboard-section__overview"><em>(Total: ${
                data.length
              })</em></div>
              <div class="dashboard-section__cards">
                    ${this.renderProduct(data)}
              </div>
          </section>
        `
      );
    });
  }

  private renderProduct(data: [Product]) {
    const products = data.map((product) => {
      const date = formatDate(product.createdAt);
      const availability = product.availability;
      return `
              <a 
                href="/${product.store.subUrl}/${product._id}"
                target="_blank" rel="noopener noreferrer"
              >
                <div 
                 data-id="${product._id}"
                 data-type="PRODUCT"
                 class="dashboard-section__card product-card"
                >
                    <div class="product-card__img">
                        <img src="${product.photos[0]}" />
                    </div>
                    <div class="product-card__info">
                        <div class="product-card__top">
                            <span class="product-card__title">${
                              product.name
                            }</span>
                            <span 
                             class="product-card__${availability
                               .toLowerCase()
                               .replace(/\s/g, "-")}"
                            >
                             ${
                               availability === "In Stock"
                                 ? `<i class="bi bi-check-lg"></i>`
                                 : `<i class="bi bi-exclamation-circle"></i>`
                             }
                             ${availability}
                            </span>
                        </div>
                        <span class="product-card__store">${
                          product.store.name
                        }</span>
                        ·
                        <span class="product-card__date">${date}</span>
                        <div class="product-card__bottom">
                            <span class="product-card__price">€${
                              product.price
                            }</span>
                            <button class="btn btn-primary card-btn">Actions</button>
                        </div>
                    </div>
                </div>
              </a>
          `;
    });

    return products.join("");
  }
}
