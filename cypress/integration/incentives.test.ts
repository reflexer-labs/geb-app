/// <reference types="Cypress" />

describe('Incentives Page', () => {
    beforeEach(() => cy.visit('/incentives'))
    it('loads Incentives page', () => {
        cy.get('#incentives-page')
    })

    it('has stats grid box', () => {
        cy.get('#campaign-box').contains('Campaign')
        cy.get('#reward-box').contains('My Reward Rate')
        cy.get('#stake-box').contains('My Stake')
        cy.get('#deposit-btn').contains('Deposit')
        cy.get('#withdraw-btn').contains('Withdraw')
    })

    it('has incentives assets', () => {
        cy.get('#incentives-assets').contains('Assets')
        cy.get('#reward-box').contains('My Reward Rate')
        cy.get('#stake-box').contains('My Stake')
        cy.get('#deposit-btn').contains('Deposit')
        cy.get('#withdraw-btn').contains('Withdraw')
    })
})
