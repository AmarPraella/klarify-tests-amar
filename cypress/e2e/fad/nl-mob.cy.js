describe("NL FAD test cases", () => {
  beforeEach(() => {
      cy.visit("https://allesoverallergie.nl/?_ab=0&_fd=0&_sc=1&preview_theme_id=123778826345");
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
      "FAD_SwitchView"
  ];

  const searchLocation = (location) => {
      cy.get("#fad-search").within(() => {
          cy.get(".mapboxgl-ctrl-geocoder--input").clear().type(location);
          cy.wait(200);
          cy.get(".suggestions").find("li.active").click();
      });
  };

  const assertEventExist = (eventName) => {
      cy.window().then((win) => {
          const dataLayer = win.dataLayer;
          const searchEventExist = dataLayer.some((layer) => {
              return layer.event === eventName;
          });
          expect(searchEventExist, `Data layer event ${eventName} generated`)
              .to.be.true;
      });
  };

  const searchAndAssertEvent = (html, selector, eventName) => {
      if (html.find(selector).length > 0) {
          cy.get(selector)
              .first()
              .invoke("on", "click", (e) => {
                  // console.log("stop the default browser behavior");
                  e.preventDefault();
              })
              .click({ force: true });
          cy.wait(1000);
          assertEventExist(eventName);
      } else {
          cy.log(
              `${eventName} not generated because ${selector} element not found!`
          );
      }
  };

  function downloadDataLayerJson(exportObj, exportName) {
      let dataStr =
          "data:text/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(exportObj));
      let downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", exportName);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  }

  it("Tests FAD on mobile", () => {
      cy.viewport(390, 844); // iphone 12pro
      cy.wait(6000)

      cy.get('button[aria-label="Alles accepteren"]').click();


      // find and click on FAD button
      cy.get(".nav-fill").find("a[name='menu']").click();
      cy.get("#find-doctor-link").click();
      //cy.url().should("include", "/pages/find-a-doctor");
      cy.wait(3000).then(() => {
          cy.window()
              .should("have.property", "dataLayer")
              .then((dataLayer) => {
                  const eventExist = dataLayer.some((layer) => {
                      return eventsNames.includes(layer.event);
                  });
                  expect(eventExist, "No custom events exists").to.be.false;
              });
      });
      // Fad search
      searchLocation("Amstelveen");
      assertEventExist("FAD_Search");

      // map interaction
      cy.get(".mapboxgl-ctrl-zoom-out").first().click();
      cy.wait(1000);
      assertEventExist("FAD_MapInteraction");

      // pin click
      cy.get("#map-block")//.find(".mapboxgl-popup-close-button").click();
      cy.get(".mapboxgl-marker")
          .first()
          .trigger("click", { force: true, pointerType: "mouse" });
      cy.wait(1000);
      assertEventExist("FAD_PinClick");

      // doctor card click & detail click
      cy.get("#list-change-btn").click();
      assertEventExist("FAD_SwitchView")
      cy.get(".search-data-block")
          .then(($dataBlock) => {
              const firstBlock = cy.wrap($dataBlock).first();
              firstBlock.click();
              cy.wait(1000);
              assertEventExist("FAD_DoctorListViewed");
              return firstBlock.find(".detail-btn");
          })
          .then(($detailBtn) => {
              cy.wrap($detailBtn).click();
              cy.wait(1000);
              assertEventExist("FAD_DoctorDetailClick");
          });

      // Filter clicked
      cy.get("#fad-filters-btn").click();
      cy.wait(1000);
      assertEventExist("FAD_FilterClick");

      // Filter applied
      cy.get("#fad-list-filter-block").within(() => {
          cy.get("#mile-100").check({ force: true });
          cy.get("#fad-filters-apply-btn").click();
          cy.wait(1000);
          assertEventExist("FAD_FilterApplied");
      });

      // Doctor details
      searchLocation("Hilversum");

      cy.get(".fad-list-search-body").then(($searchBody) => {
          // phone
          searchAndAssertEvent($searchBody, ".doc-phone", "FAD_PhoneClick");
          // email
          searchAndAssertEvent($searchBody, ".doc-email", "FAD_MailClick");
          // direction button
          searchAndAssertEvent(
              $searchBody,
              ".direction-btn",
              "FAD_DirectionsClick"
          );
          // booking button
          searchAndAssertEvent(
              $searchBody,
              ".online-appointment-click",
              "FAD_BookClick"
          );
          // website button
          searchAndAssertEvent(
              $searchBody,
              ".website-click",
              "FAD_WebsiteClick"
          );
      });

      // download dataLayer json object
      cy.window()
          .should("have.property", "dataLayer")
          .then((dataLayer) => {
              downloadDataLayerJson(
                  { dataLayer: [...dataLayer] },
                  `data-layer-${Date.now()}.json`
              );
          });
  });
});
