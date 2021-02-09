/// <reference types="Cypress" />

import { TEST_ADDRESS_NEVER_USE_SHORTENED } from '../support/commands';

describe('Landing Page', () => {
  beforeEach(() => cy.visit('/'));
  it('loads Onboarding page', () => {
    cy.get('#app-page');
  });

  it('checks if cookie banner is visible', () => {
    cy.get('#cookies-consent');
  });

  it('is connected', () => {
    cy.get('#web3-status-connected').contains(TEST_ADDRESS_NEVER_USE_SHORTENED);
    cy.get('#web3-status-connected').click();
    cy.get('#web3-account-identifier-row').contains(
      TEST_ADDRESS_NEVER_USE_SHORTENED
    );
  });
});
