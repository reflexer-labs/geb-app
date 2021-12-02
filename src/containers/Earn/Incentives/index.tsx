import Axios from 'axios'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Round } from '../../../utils/interfaces'
import IncentiveRound from './IncentiveRound'

const Incentives = () => {
    const [incentives, setIncentives] = useState<Array<Round>>([])

    useEffect(() => {
        async function fetchIncentives() {
            try {
                const res = await Axios.get(
                    `https://4svutwkz1c.execute-api.eu-west-2.amazonaws.com/v1/`
                )
                setIncentives(res.data.data.rounds)
            } catch (error) {
                console.log(error)
            }
        }
        fetchIncentives()
    }, [])

    return (
        <Container>
            <Inner>
                {incentives.length > 0
                    ? incentives.map((round, index: number) => {
                          return (
                              <IncentiveRound
                                  round={round}
                                  collapsed={index !== 0}
                                  key={round.name + round.number}
                              />
                          )
                      })
                    : null}
            </Inner>
        </Container>
    )
}

export default Incentives

const Container = styled.div`
    max-width: 1024px;
    margin: 80px auto;
    padding: 0 15px;
    @media (max-width: 767px) {
        margin: 50px auto;
    }
`
const Inner = styled.div`
    padding: 15px;
    border-radius: 15px;
    background: ${(props) => props.theme.colors.colorSecondary};
`
