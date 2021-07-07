import Axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import GridContainer from '../../../components/GridContainer'
import PageHeader from '../../../components/PageHeader'
import { Round } from '../../../utils/interfaces'
import IncentiveRound from './IncentiveRound'

const Incentives = () => {
    const { t } = useTranslation()
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
        <GridContainer>
            <PageHeader
                breadcrumbs={{ '/': t('incentives_header_title') }}
                text={t('incentives_header_desc')}
            />
            <Container>
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
            </Container>
        </GridContainer>
    )
}

export default Incentives

const Container = styled.div``
