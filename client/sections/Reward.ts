import axios from "axios";

import Section from "./Section";
import Reward from "../types/Reward";
import formatDate from "../helpers/formatDate";

export default class RewardSection extends Section {
  constructor() {
    super("REWARD", () => new RewardSection());

    axios({
      url: "/api/v1/rewards",
      method: "GET",
    }).then((res) => {
      const data = res.data.data as [Reward];

      this.render(
        `
            <section class="dashboard-section" id="reward">
                <div class="dashboard-section__top">
                    <h2 class="dashboard-section__title">Manage Rewards</h2>
                    <button class="btn btn-primary" id="newREWARD">New Reward</button>
                </div>
                <div class="dashboard-section__overview"><em>(Total: ${
                  data.length
                })</em></div>
                <div class="dashboard-section__cards">
                    ${this.renderReward(data)}
                </div>
            </section>
        `
      );
    });
  }

  private renderReward(data: [Reward]) {
    const rewards = data.map((reward) => {
      const date = formatDate(reward.createdAt);
      const availability = reward.product.availability;
      return `
        <a 
        href="/stores/${reward.product.store.subUrl}/${
        reward.product._id
      }?type=reward"
        target="_blank" rel="noopener noreferrer"
        >
          <div 
           data-id="${reward._id}"
           data-type="REWARD"
           class="dashboard-section__card product-card"
          >
              <div class="product-card__img">
                  <img src="${reward.product.photos[0]}" />
              </div>
              <div class="product-card__info">
                  <div class="product-card__top">
                      <span class="product-card__title">${
                        reward.product.name
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
                    reward.product.store.name
                  }</span>
                  ·
                  <span class="product-card__date">${date}</span>
                  <div class="product-card__bottom">
                      <span class="product-card__points">
                          ${reward.requiredPoints} Points
                      </span>
                      <button class="btn btn-primary card-btn">Actions</button>
                  </div>
              </div>
          </div>
        </a>
      `;
    });

    for (let i = 0; i <= rewards.length % 3; i++) {
      rewards.push(`<div class="wrapper"></div>`);
    }

    return rewards.join("");
  }
}
