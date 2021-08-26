/// <reference types="Cypress" />

import {
    returnWalletAddress,
    TEST_ADDRESS_NEVER_USE,
} from '../support/commands'

describe('App Page - Safe Details', () => {
    const getValue = (val: string) => val.replace(/[^\d.]*/g, '')

    beforeEach(() => {
        cy.visit('/')
        cy.wait(2000)
        cy.get('body').then((body) => {
            if (body.find('[data-test-id="waiting-modal"]').length > 0) {
                cy.get('[data-test-id="waiting-modal"]').then((e) => {
                    if (e.is(':visible')) {
                        cy.waitUntil(() => Cypress.$(e).is(':hidden'), {
                            timeout: 100000,
                        })
                    }
                })
            }
        })
        cy.contains('✓ Accept').click()
        cy.get('.safeBlock').first().contains('Manage Safe').click()
        cy.wait(2000)
        cy.get('body').then((body) => {
            if (body.find('[data-test-id="waiting-modal"]').length > 0) {
                cy.get('[data-test-id="waiting-modal"]').then((e) => {
                    if (e.is(':visible')) {
                        cy.waitUntil(() => Cypress.$(e).is(':hidden'), {
                            timeout: 100000,
                        })
                    }
                })
            }
        })
        cy.wait(5000)
    })

    it('is connected', () => {
        const shortenedAddress = returnWalletAddress(TEST_ADDRESS_NEVER_USE)
        cy.get('#web3-status-connected').contains(shortenedAddress)
        cy.get('#web3-status-connected').click()
        cy.get('#web3-account-identifier-row').contains(shortenedAddress)
    })

    it('should show equal values between details and deposit & borrow modal', () => {
        cy.get('#deposit_borrow').click()
        cy.get('[data-test-id="details_col_ratio"]')
            .invoke('text')
            .then((tx) => {
                expect(cy.get('[data-test-id="modal_col_ratio"]').contains(tx))
            })
        cy.get('[data-test-id="details_liq_price"]')
            .invoke('text')
            .then((tx) => {
                expect(cy.get('[data-test-id="modal_liq_price"]').contains(tx))
            })
        cy.get('[data-test-id="details_liq_penalty"]')
            .invoke('text')
            .then((tx) => {
                expect(
                    cy.get('[data-test-id="modal_liq_penalty"]').contains(tx)
                )
            })
        cy.get('[data-test-id="details_eth_price"]')
            .invoke('text')
            .then((tx) => {
                expect(cy.get('[data-test-id="modal_eth_price"]').contains(tx))
            })
        cy.get('[data-test-id="details_red_price"]')
            .invoke('text')
            .then((tx) => {
                expect(cy.get('[data-test-id="modal_red_price"]').contains(tx))
            })

        cy.get('[data-test-id="details_collateral"]')
            .invoke('text')
            .then((tx) => {
                const val = tx.split(' ')[0]
                expect(
                    cy.get('[data-test-id="modal_collateral"]').contains(val)
                )
            })
        cy.get('[data-test-id="details_debt"]')
            .invoke('text')
            .then((tx) => {
                const val = tx.split(' ')[0]
                expect(cy.get('[data-test-id="modal_debt"]').contains(val))
            })
    })

    it('should show equal values between details and repay & withdraw modal', () => {
        cy.get('#repay_withdraw').click()
        cy.get('[data-test-id="details_col_ratio"]')
            .invoke('text')
            .then((tx) => {
                expect(cy.get('[data-test-id="modal_col_ratio"]').contains(tx))
            })
        cy.get('[data-test-id="details_liq_price"]')
            .invoke('text')
            .then((tx) => {
                expect(cy.get('[data-test-id="modal_liq_price"]').contains(tx))
            })
        cy.get('[data-test-id="details_liq_penalty"]')
            .invoke('text')
            .then((tx) => {
                expect(
                    cy.get('[data-test-id="modal_liq_penalty"]').contains(tx)
                )
            })
        cy.get('[data-test-id="details_eth_price"]')
            .invoke('text')
            .then((tx) => {
                expect(cy.get('[data-test-id="modal_eth_price"]').contains(tx))
            })
        cy.get('[data-test-id="details_red_price"]')
            .invoke('text')
            .then((tx) => {
                expect(cy.get('[data-test-id="modal_red_price"]').contains(tx))
            })
        cy.get('[data-test-id="details_collateral"]')
            .invoke('text')
            .then((tx) => {
                const val = tx.split(' ')[0]
                expect(
                    cy.get('[data-test-id="modal_collateral"]').contains(val)
                )
            })
        cy.get('[data-test-id="details_debt"]')
            .invoke('text')
            .then((tx) => {
                const val = tx.split(' ')[0]
                expect(cy.get('[data-test-id="modal_debt"]').contains(val))
            })
    })

    it('tries max borrow, and checks on CRatio and LiquidationPrice', () => {
        cy.get('#deposit_borrow').click()
        cy.get('[data-test-id="deposit_borrow_left"]').type('4')
        cy.get('[data-test-id="deposit_borrow_right_label"]')
            .invoke('text')
            .then((tx) => {
                cy.get('[data-test-id="deposit_borrow_right"]').type(
                    getValue(tx)
                )
                cy.wait(2000)
                cy.get('[data-test-id="modal_col_ratio"]').contains('140.00%')
                cy.get('[data-test-id="details_eth_price"]')
                    .invoke('text')
                    .then((tx) => {
                        expect(
                            cy
                                .get('[data-test-id="modal_liq_price"]')
                                .contains(tx)
                        )
                    })
            })
    })

    it('should show error if no amount to deposit or borrow', () => {
        cy.get('#deposit_borrow').click()
        cy.get('[data-test-id="deposit_borrow_left"]').type('0')
        cy.get('[data-test-id="deposit_borrow_right"]').type('0')
        cy.contains('Review Transaction').click()
        cy.contains('Please enter the amount')
    })

    it('should show error if not enough Eth to deposit', () => {
        cy.get('#deposit_borrow').click()
        cy.get('[data-test-id="deposit_borrow_left"]').type('50')
        cy.contains('Review Transaction').click()
        cy.contains('Insufficient balance')
    })

    it('should show error if RAI exceeds available amount to borrow', () => {
        cy.get('#deposit_borrow').click()
        cy.get('[data-test-id="deposit_borrow_right"]').type('3000')
        cy.contains('Review Transaction').click()
        cy.contains('RAI borrowed cannot exceed available amount')
    })

    it('should show error if no amount to repay or withdraw', () => {
        cy.get('#repay_withdraw').click()
        cy.get('[data-test-id="repay_withdraw_left"]').type('0')
        cy.get('[data-test-id="repay_withdraw_right"]').type('0')
        cy.contains('Review Transaction').click()
        cy.contains(
            'Please enter the amount of ETH to free or the amount of RAI to be repay'
        )
    })

    it('should show error if amount to withdraw exeeds available amount', () => {
        cy.get('#repay_withdraw').click()
        cy.get('[data-test-id="repay_withdraw_left"]').type('1000')
        cy.contains('Review Transaction').click()
        cy.contains('ETH to unlock cannot exceed available amount')
    })

    it('should show error if amount to repay exeeds owed amount', () => {
        cy.get('#repay_withdraw').click()
        cy.get('[data-test-id="repay_withdraw_right"]').type('1000')
        cy.contains('Review Transaction').click()
        cy.contains('RAI to repay cannot exceed owed amount')
    })

    it('should show error if too much debt', () => {
        cy.get('#repay_withdraw').click()
        cy.get('[data-test-id="repay_withdraw_left"]').type('1.5')
        cy.contains('Review Transaction').click()
        cy.contains('Too much debt')
    })

    it('should show error if debt is greater than debt floor', () => {
        cy.get('#repay_withdraw').click()
        cy.get('[data-test-id="repay_withdraw_right"]').type('530')
        cy.contains('Review Transaction').click()
        cy.contains(`The resulting debt should be at least`)
    })

    it('should perform a successful deposit and borrow transaction', () => {
        cy.get('#deposit_borrow').click()
        cy.get('[data-test-id="deposit_borrow_left"]').type('0.001')
        cy.get('[data-test-id="deposit_borrow_right"]').type('0.001')
        cy.contains('Review Transaction').click()
        cy.contains('Confirm Transaction Details')
        cy.get('#confirm_tx').click()
        cy.get('[data-test-id="waiting-modal-title"]')
            .should('be.visible')
            .then((e) =>
                cy.waitUntil(
                    () => Cypress.$(e).text() === 'Transaction Submitted',
                    {
                        timeout: 100000,
                        interval: 2000,
                    }
                )
            )

        cy.contains('Close').click()
        cy.get('#web3-status-connected').click()
        cy.contains('Clear All').click()
    })

    it('should perform a successful repay and withdraw transaction', () => {
        cy.get('#repay_withdraw').click()
        cy.get('[data-test-id="repay_withdraw_left"]').type('0.001')
        cy.get('[data-test-id="repay_withdraw_right"]').type('0.001')
        cy.contains('Review Transaction').click()
        cy.contains('Confirm Transaction Details')
        cy.get('#confirm_tx').click()

        cy.get('[data-test-id="waiting-modal-title"]')
            .should('be.visible')
            .then((e) =>
                cy.waitUntil(
                    () => Cypress.$(e).text() === 'Transaction Submitted',
                    {
                        timeout: 100000,
                        interval: 2000,
                    }
                )
            )

        cy.contains('Close').click()
        cy.get('#web3-status-connected').click()
        cy.contains('Clear All').click()
    })
})
