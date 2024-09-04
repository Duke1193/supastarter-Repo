describe("homepage", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	describe("navigation", () => {
		it("should have all navigation links", () => {
			const nav = cy.get("nav");
			nav.should("exist");

			const pricingLink = nav.get('a[href="/pricing"]');
			pricingLink.should("exist");
			pricingLink.should("contain", "Pricing");

			const blogLink = nav.get('a[href="/blog"]');
			blogLink.should("exist");
			blogLink.should("contain", "Blog");
		});
	});

	describe("dark mode", () => {
		it("should have a color mode toggle", () => {
			cy.get('[data-test="color-mode-toggle"]').should("exist");
		});

		it("should toggle to light mode if selected", () => {
			cy.get('[data-test="color-mode-toggle"]').click();
			cy.get('[data-test="color-mode-toggle-item-light"]').click();

			cy.get("html").should("have.class", "light");
		});

		it("should toggle to dark mode if selected", () => {
			cy.get('[data-test="color-mode-toggle"]').click();
			cy.get('[data-test="color-mode-toggle-item-dark"]').click();

			cy.get("html").should("have.class", "dark");
		});
	});
});
