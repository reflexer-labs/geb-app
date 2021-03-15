/// <reference types="Cypress" />

import {
    ADDRESS_NO_SAFES_NEVER_USER,
    returnWalletAddress,
} from '../support/commands'

describe('App Page - No Safes', () => {
    beforeEach(() =>
        cy.visit('/', {
            qs: { type: 'no_safes' },
        })
    )
    it('loads App page', () => {
        cy.get('#app-page')
    })

    it('is connected', () => {
        const shortenedAddress = returnWalletAddress(
            ADDRESS_NO_SAFES_NEVER_USER
        )
        console.log(shortenedAddress)

        cy.get('#web3-status-connected').contains(shortenedAddress)
        cy.get('#web3-status-connected').click()
        cy.get('#web3-account-identifier-row').contains(shortenedAddress)
    })

    it('is has a safe', () => {
        cy.contains('✓ Accept').click()
        cy.get('#step2 > div').contains('Create a Safe')
        cy.get('[data-test-id="steps-btn"]').contains('Create Account').click()
        cy.wait(2000)
        cy.get('safe-header').contains('Create a Safe')
    })
})
