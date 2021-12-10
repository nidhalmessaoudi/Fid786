import Section from "./Section";

export default class ProductSection extends Section {
  constructor() {
    super("PRODUCT");

    this.render(
      `
        <section class="dashboard-section" id="products">
            <div class="dashboard-section__top">
                <h2 class="dashboard-section__title">Manage Products</h2>
                <button class="btn btn-primary" id="newPRODUCT">New Product</button>
            </div>
            <div class="dashboard-section__overview"><em>(Total: 12)</em></div>
            <div class="dashboard-section__cards">
                <div class="dashboard-section__card product-card">
                    <div class="product-card__img">
                        <img src="data:image/jpeg;base64,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"></img>
                    </div>
                    <div class="product-card__info">
                        <span class="product-card__title">SanDisk 128GB</span>
                        <span class="product-card__store">TUNTECH</span>
                        ·
                        <span class="product-card__date">10 Dec, 2021</span>
                        <span class="product-card__price">€17.99</span>
                    </div>
                </div>
                <div class="dashboard-section__card">
                    Test2
                </div>
                <div class="dashboard-section__card">
                    Test3
                </div>
                <div class="dashboard-section__card">
                    Test4
                </div>
            </div>
        </section>
    `
    );
  }
}
