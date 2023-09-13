describe("US FAD test cases desktop", () => {
    beforeEach(() => {
        cy.viewport(1920, 1080);
    });

    it("Checks FAD is working as expected", () => {
        cy.visit("https://us.klarify.me");
        cy.get(".find-doctor-link")
            .find("a[href='/pages/find-a-doctor']")
            .click();
        cy.url().should("include", "/pages/find-a-doctor");
        cy.wait(4000);
        cy.window().should("have.property", "dataLayer");
        cy.get("#fad-search").within(() => {
            cy.get(".mapboxgl-ctrl-geocoder--input").type("New York");
            cy.wait(1000);
            cy.get(".suggestions").find("li.active").click();
            cy.window().then((win) => {
                const dataLayer = win.dataLayer; // Assuming the data layer is stored in the "dataLayer" variable
                // Check if the specific event is in the data layer
                const fadSearchEventExist = dataLayer.some((layer) => {
                    return layer.event === "FAD_Search"; // Replace with the actual event name
                });
                // Assert that the specific event exists
                expect(fadSearchEventExist).to.be.true;
            });
        });
    });
});
