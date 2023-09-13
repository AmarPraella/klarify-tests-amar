describe("US FAD test cases desktop", () => {
    beforeEach(() => {
        cy.viewport(1920, 1080);
    });

    const eventsNames = [
        "FAD_Search",
        "FAD_MapInteraction",
        "FAD_PinClick",
        "FAD_DoctorListViewed",
        "FAD_DoctorDetailClick",
        "FAD_FilterClick",
        "FAD_FilterApplied",
        "FAD_PhoneClick",
        "FAD_MailClick",
        "FAD_DirectionsClick",
        "FAD_BookClick",
        "FAD_WebsiteClick",
    ];

    it("Checks FAD is working as expected", () => {
        cy.visit("https://us.klarify.me");
        cy.get(".find-doctor-link")
            .find("a[href='/pages/find-a-doctor']")
            .click();
        cy.url().should("include", "/pages/find-a-doctor");
        cy.wait(4000);
        cy.window()
            .should("have.property", "dataLayer")
            .then((dataLayer) => {
                const eventExist = dataLayer.some((layer) => {
                    return eventsNames.includes(layer.event); // Replace with the actual event name
                });
                expect(eventExist).to.be.false;
            });

        // Fad search
        cy.get("#fad-search").within(() => {
            cy.get(".mapboxgl-ctrl-geocoder--input").type("New York");
            cy.wait(500);
            cy.get(".suggestions").find("li.active").click();
            cy.window().then((win) => {
                const dataLayer = win.dataLayer; // Assuming the data layer is stored in the "dataLayer" variable
                // Check if the specific event is in the data layer
                const searchEventExist = dataLayer.some((layer) => {
                    return layer.event === "FAD_Search"; // Replace with the actual event name
                });
                // Assert that the specific event exists
                expect(searchEventExist).to.be.true;
            });
        });

        // map interaction
        cy.get(".mapboxgl-ctrl-zoom-out").click();
        cy.wait(2000);
        cy.window().then((win) => {
            const dataLayer = win.dataLayer; // Assuming the data layer is stored in the "dataLayer" variable
            // Check if the specific event is in the data layer
            const mapInteractionEventExist = dataLayer.some((layer) => {
                return layer.event === "FAD_MapInteraction"; // Replace with the actual event name
            });
            // Assert that the specific event exists
            expect(mapInteractionEventExist).to.be.true;
        });
    });
});

// Cypress.Commands.add('assertEventNotPresent', (arrayOfObjects, eventName) => {
//     cy.wrap(arrayOfObjects).should('not.include', { event: eventName });
//   });
