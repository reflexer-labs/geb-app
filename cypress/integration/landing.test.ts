/// <reference types="Cypress" />

import { TEST_ADDRESS_NEVER_USE_SHORTENED } from '../support/commands'

describe('App Page', () => {
    beforeEach(() => cy.visit('/'))
    it('loads App page', () => {
        cy.get('#app-page')
    })

    it('checks if cookie banner is visible', () => {
        cy.get('#cookies-consent')
    })

    it('is connected', () => {
        cy.get('#web3-status-connected').contains(
            TEST_ADDRESS_NEVER_USE_SHORTENED
        )
        cy.get('#web3-status-connected').click()
        cy.get('#web3-account-identifier-row').contains(
            TEST_ADDRESS_NEVER_USE_SHORTENED
        )
    })

    it('has create safe', () => {
        cy.get('#create-safe').contains('Safe')
        cy.get('#create-safe').click()
        cy.get('#safe-header').contains('Create a Safe')
    })

    it('allows navigation to incentives', () => {
        cy.get('#incentives-link').click()
        cy.url().should('include', '/incentives')
    })
})
