/// <reference types="Cypress" />

import {
    ADDRESS_NO_PROXY_NEVER_USER,
    returnWalletAddress,
} from '../support/commands'

describe('App Page - No Proxy', () => {
    beforeEach(() =>
        cy.visit('/', {
            qs: { type: 'no_proxy' },
        })
    )
    it('loads App page', () => {
        cy.get('#app-page')
    })

    it('is connected', () => {
        const shortenedAddress = returnWalletAddress(
            ADDRESS_NO_PROXY_NEVER_USER
        )
        cy.get('#web3-status-connected').contains(shortenedAddress)
        cy.get('#web3-status-connected').click()
        cy.get('#web3-account-identifier-row').contains(shortenedAddress)
    })

    it('checks if cookie banner is visible', () => {
        cy.get('#cookies-consent')
        cy.contains('✓ Accept').click()
    })

    it('has no proxy', () => {
        cy.get('#step1 > div').contains('Create Account')
        cy.contains('✓ Accept').click()
        cy.get('[data-test-id="steps-btn"]').contains('Create Account').click()
        cy.wait(2000)
        cy.contains('Transaction Failed').should('be.visible')
        cy.contains('Dismiss').should('be.visible')
    })

    // it('has not connected wallet', () => {
    //     cy.get('#web3-status-connected').contains('Connect Wallet')
    //     cy.get('#step1 > div').contains('Connect Wallet')
    //     cy.get('#step1 ul li:nth-child(2) span').should('have.value')
    //     cy.get('#step1 button').should('be.visible').contains('Connect Wallet')
    // })

    // it('allows navigation to incentives', () => {
    //     cy.get('#incentives-link').click()
    //     cy.url().should('include', '/incentives')
    // })
})
