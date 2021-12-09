import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import Button from '../../../components/Button'
import { useActiveWeb3React } from '../../../hooks'
import useGeb, { useSafeHandler } from '../../../hooks/useGeb'
import {
    useDisconnectSaviour,
    useHasLeftOver,
    useSaviourGetReserves,
    useSaviourWithdraw,
    useSaviourInfo,
} from '../../../hooks/useSaviour'
import { useStoreActions, useStoreState } from '../../../store'
import { isNumeric } from '../../../utils/validations'
import AlertLabel from '../../../components/AlertLabel'
import useInterval from '../../../hooks/useInterval'
import { handleTransactionError } from '../../../hooks/TransactionHooks'
import SaviourStats from './SaviourStats'
import SaviourOps from './SaviourOps'
import Dropdown from '../../../components/Dropdown'
import { SaviourType } from '../../../model/safeModel'
import SaviourHeader from './SaviourHeader'

const SafeSaviour = ({ ...props }) => {
    const { account, library } = useActiveWeb3React()
    const [isLoading, setIsLoading] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [isModifying, setIsModifying] = useState(false)

    const safeId = props.match.params.id as string
    const history = useHistory()
    const geb = useGeb()
    const {
        saviourData,
        hasSaviour,
        saviourState: { saviourType },
    } = useSaviourInfo()
    const { disconnectSaviour } = useDisconnectSaviour()
    const { withdrawCallback } = useSaviourWithdraw()
    const { getReservesCallback } = useSaviourGetReserves()

    const SAVIOUR_TYPES = [
        {
            item: 'Uniswap v2 RAI/ETH',
            img: require('../../../assets/uniswap-icon.svg'),
            href: `https://app.uniswap.org/#/add/v2/${saviourData?.coinAddress}/ETH`,
            isExternal: true,
            shortName: 'uniswap',
        },
        {
            item: 'Curve RAI/3Pool',
            img: require('../../../assets/curve.svg'),
            href: `https://app.uniswap.org/#/add/v2/${saviourData?.coinAddress}/ETH`,
            isExternal: true,
            shortName: 'curve',
        },
    ]

    const { popupsModel: popupsActions, safeModel: safeActions } =
        useStoreActions((state) => state)

    const { safeModel: safeState, connectWalletModel: connectWalletState } =
        useStoreState((state) => state)

    const { singleSafe } = safeState
    const { fiatPrice: ethPrice } = connectWalletState

    const safeHandler = useSafeHandler(safeId)
    const leftOver = useHasLeftOver(safeHandler)

    const handleSelectedType = useCallback(
        (selected: string) => {
            // if (hasSaviour) {
            //     setShowAlert(true)
            //     return
            // }
            const found = SAVIOUR_TYPES.find((item) => item.item === selected)
            if (found) {
                safeActions.setSaviourType(found.shortName as SaviourType)
            }
        },
        [SAVIOUR_TYPES, hasSaviour, safeActions]
    )

    useEffect(() => {
        if (!account) return
        if (!isNumeric(safeId)) {
            history.goBack()
        }
    }, [account, history, safeId])

    const fetchSaviourDataCallback = useCallback(() => {
        if (!account || !geb || !safeId) return
        safeActions.fetchSaviourData({
            account,
            geb,
            safeId,
            ethPrice,
        })
    }, [account, ethPrice, geb, safeActions, safeId])

    useEffect(() => {
        fetchSaviourDataCallback()
    }, [fetchSaviourDataCallback])

    useInterval(fetchSaviourDataCallback, 5000)

    const handleDisconnectSaviour = async () => {
        if (!library || !account || !saviourData || !saviourData?.hasSaviour)
            throw new Error('No library, account or saviour')
        setIsLoading(true)
        try {
            popupsActions.setIsWaitingModalOpen(true)
            popupsActions.setWaitingPayload({
                title: 'Waiting For Confirmation',
                hint: 'Confirm this transaction in your wallet',
                status: 'loading',
            })
            const signer = library.getSigner(account)
            if (leftOver.status) {
                await getReservesCallback(signer, {
                    safeId: Number(safeId),
                    saviourAddress: saviourData.saviourAddress,
                })
            } else if (Number(saviourData.saviourBalance) === 0) {
                await disconnectSaviour(signer, {
                    safeId: Number(safeId),
                    saviourAddress: saviourData.saviourAddress,
                })
            } else {
                await withdrawCallback(signer, {
                    safeId: Number(safeId),
                    safeHandler: singleSafe?.safeHandler as string,
                    amount: saviourData.saviourBalance,
                    isMaxWithdraw: true,
                    targetedCRatio: saviourData.saviourRescueRatio,
                    isTargetedCRatioChanged: false,
                })
            }
        } catch (e) {
            handleTransactionError(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <ContentContainer>
            <Container>
                <SaviourHeader
                    isModifying={isModifying}
                    safeId={safeId}
                    saviourData={saviourData}
                    saviourType={saviourType}
                />

                {isModifying || hasSaviour ? (
                    <Content>
                        {showAlert ? (
                            <LabelContainer>
                                <AlertLabel
                                    isBlock={false}
                                    text={`Please disconnect your current Saviour first`}
                                    type="warning"
                                />
                            </LabelContainer>
                        ) : null}
                        <Inner>
                            <StatsBlock>
                                <Label>Select Saviour</Label>
                                <Flex>
                                    <DropDownContainer>
                                        <Dropdown
                                            items={SAVIOUR_TYPES}
                                            itemSelected={
                                                SAVIOUR_TYPES.filter(
                                                    (type) =>
                                                        type.shortName ===
                                                        saviourType
                                                )[0]
                                            }
                                            getSelectedItem={handleSelectedType}
                                            label={''}
                                            padding={'22px 20px'}
                                            imgSize={'28px'}
                                        />
                                    </DropDownContainer>
                                    {hasSaviour ? (
                                        <Button
                                            primary
                                            text={'disconnect_saviour'}
                                            isLoading={isLoading}
                                            disabled={isLoading}
                                            onClick={handleDisconnectSaviour}
                                        />
                                    ) : null}
                                </Flex>

                                <SaviourStats type={SAVIOUR_TYPES[0].item} />
                            </StatsBlock>

                            <OpsBlock>
                                <SaviourOps />
                            </OpsBlock>
                        </Inner>
                    </Content>
                ) : (
                    <BtnContainer>
                        <Button onClick={() => setIsModifying(true)}>
                            Configure
                        </Button>
                    </BtnContainer>
                )}
            </Container>
        </ContentContainer>
    )
}

export default SafeSaviour

const DropDownContainer = styled.div`
    min-width: 412px;
`

const ContentContainer = styled.div`
    max-width: 880px;
    margin: 80px auto;
    padding: 0 15px;
    @media (max-width: 767px) {
        margin: 50px auto;
    }
`

const Container = styled.div``

const Content = styled.div`
    margin-top: 20px;
`
const Inner = styled.div``

const OpsBlock = styled.div``

const StatsBlock = styled.div``

const Flex = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`

const LabelContainer = styled.div`
    margin: 0 auto 20px auto;
`
const Label = styled.div`
    line-height: 21px;
    color: ${(props) => props.theme.colors.secondary};
    font-size: ${(props) => props.theme.font.small};
    letter-spacing: -0.09px;
    margin-bottom: 4px;
    text-transform: capitalize;
`

const BtnContainer = styled.div`
    margin-top: 20px;
    text-align: center;
`
