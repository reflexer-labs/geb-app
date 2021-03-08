import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import Button from '../../components/Button'
import GridContainer from '../../components/GridContainer'
import PageHeader from '../../components/PageHeader'
import SafeHistory from '../../components/SafeHistory'
import StartShutdown from '../../components/StartShutdown'
import { useStoreActions, useStoreState } from '../../store'

const EmergencyShutdown = () => {
    const { t } = useTranslation()
    const {
        popupsModel: popupsActions,
        esmModel: esmActions,
    } = useStoreActions((state) => state)
    const { esmModel: esmState } = useStoreState((state) => state)

    const handleRedeemETH = () => {
        esmActions.setOperation(0)
        popupsActions.setESMOperationPayload({ isOpen: true, type: 'ETH' })
    }

    const handleRedeemRAI = () => {
        esmActions.setOperation(0)
        popupsActions.setESMOperationPayload({ isOpen: true, type: 'RAI' })
    }

    return (
        <>
            <GridContainer>
                {esmState.isES ? null : (
                    <PageHeader
                        breadcrumbs={{ '/': t('emergency_shutdown') }}
                        text={t('esm_text')}
                    />
                )}

                {esmState.isES ? (
                    <ShutdownContainer>
                        <StartShutdown />
                    </ShutdownContainer>
                ) : null}
                <ClaimBlocks>
                    <ClaimItem>
                        <InnerContent>
                            <Value>{esmState.totalEth} ETH</Value>
                            <Label>{'Claimable ETH from Safes'}</Label>
                            <Actions>
                                <Button
                                    dimmedWithArrow={esmState.isES}
                                    withArrow={
                                        !esmState.isES &&
                                        Number(esmState.totalEth) > 0
                                    }
                                    arrowPlacement="right"
                                    text={t('redeem')}
                                    onClick={handleRedeemETH}
                                    disabled={
                                        esmState.isES ||
                                        Number(esmState.totalEth) === 0
                                    }
                                    dimmed={Number(esmState.totalEth) === 0}
                                />
                            </Actions>
                        </InnerContent>
                    </ClaimItem>

                    <ClaimItem>
                        <InnerContent>
                            <Value>{esmState.totalRai} RAI</Value>
                            <Label>{'Claimable RAI'}</Label>
                            <Actions>
                                <Button
                                    dimmedWithArrow={
                                        Number(esmState.totalEth) > 0
                                    }
                                    withArrow={
                                        Number(esmState.totalEth) === 0 &&
                                        Number(esmState.totalRai) > 0
                                    }
                                    text={t('redeem')}
                                    arrowPlacement="right"
                                    onClick={handleRedeemRAI}
                                    disabled={
                                        esmState.isES ||
                                        Number(esmState.totalRai) === 0 ||
                                        Number(esmState.totalEth) > 0
                                    }
                                    dimmed={Number(esmState.totalRai) === 0}
                                />
                            </Actions>
                        </InnerContent>
                    </ClaimItem>
                </ClaimBlocks>
                <SafeHistory hideHistory />
            </GridContainer>
        </>
    )
}

export default EmergencyShutdown

const ClaimBlocks = styled.div`
    display: flex;
    margin: 0 -7.5px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap:wrap;
  `}
`

const ClaimItem = styled.div`
    flex: 0 0 50%;
    padding: 0 7.5px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 0 0 100%;
  `}
`

const InnerContent = styled.div`
    padding: 20px 20px 15px;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: ${(props) => props.theme.global.borderRadius};
    background: ${(props) => props.theme.colors.background};
    margin-bottom: 15px;
    text-align: center;
`

const Value = styled.div`
    color: ${(props) => props.theme.colors.primary};
    font-size: ${(props) => props.theme.font.large};
    line-height: 27px;
    letter-spacing: -0.69px;
    font-weight: 600;
    ${({ theme }) => theme.mediaWidth.upToSmall`
  font-size: ${(props) => props.theme.font.medium};
`}
`

const Label = styled.div`
    color: ${(props) => props.theme.colors.secondary};
    font-size: ${(props) => props.theme.font.small};
    line-height: 21px;
    letter-spacing: -0.09px;
    margin-top: 8px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: ${(props) => props.theme.font.extraSmall};
  `}
`

const Actions = styled.div`
    display: flex;
    margin-top: 1rem;
    justify-content: flex-end;
`

const ShutdownContainer = styled.div`
    margin-top: 15px;
`
