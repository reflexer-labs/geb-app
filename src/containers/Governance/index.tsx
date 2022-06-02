import React from 'react'
import { Route } from 'react-router-dom'
import CreateProposal from './CreateProposal'
import Landing from './Landing'
import VotePage from './VotePage'

const Governance = () => {
    return (
        <>
            <Route
                exact
                strict
                path="/governance/:governorIndex/:id"
                component={VotePage}
            />
            <Route
                exact
                strict
                path="/governance/create-proposal"
                component={CreateProposal}
            />
            <Route exact strict path="/governance" component={Landing} />
        </>
    )
}

export default Governance
