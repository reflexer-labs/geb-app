import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import AuctionsFAQ from '../../components/AuctionsFAQ'
import Button from '../../components/Button'
import GridContainer from '../../components/GridContainer'
import PageHeader from '../../components/PageHeader'
import { useActiveWeb3React } from '../../hooks'
import { useStoreActions, useStoreState } from '../../store'
import AuctionsList from './AuctionsList'

export type AuctionEventType = 'DEBT' | 'SURPLUS'

const Auctions = () => {
    const { t } = useTranslation()
    const history = useHistory()
    const { account } = useActiveWeb3React()
    const {
        auctionsModel: auctionsActions,
        popupsModel: popupsActions,
    } = useStoreActions((state) => state)
    const { settingsModel: settingsState } = useStoreState((state) => state)

    const { isRPCAdapterOn } = settingsState

    const [hide, setHide] = useState(false)
    const [type, setType] = useState<AuctionEventType>('DEBT')

    const handleHideFAQ = () => setHide(!hide)

    useEffect(() => {
        if (isRPCAdapterOn) {
            history.push('/')
        }
        async function init() {
            popupsActions.setIsWaitingModalOpen(true)
            popupsActions.setWaitingPayload({
                title: 'Initializing..',
                status: 'loading',
            })
            await fetchAuctions()
            popupsActions.setIsWaitingModalOpen(false)
        }

        async function fetchAuctions() {
            await auctionsActions.fetchAuctions({
                address: account ? account : '',
                type,
            })
        }
        init()
        fetchAuctions()
        const interval = setInterval(() => {
            fetchAuctions()
        }, 2000)

        return () => clearInterval(interval)
    }, [account, auctionsActions, history, isRPCAdapterOn, popupsActions, type])

    return (
        <>
            <GridContainer>
                <Content>
                    <PageHeader
                        breadcrumbs={{ '/': t('auctions') }}
                        text={t('auctions_header_text', {
                            type: type.toLocaleLowerCase(),
                        })}
                    />
                    {hide ? (
                        <Button text={t('show_faq')} onClick={handleHideFAQ} />
                    ) : null}
                </Content>

                <Switcher>
                    <Tab
                        className={type === 'DEBT' ? 'active' : ''}
                        onClick={() => setType('DEBT')}
                    >
                        Debt Auctions
                    </Tab>
                    <Tab
                        className={type === 'SURPLUS' ? 'active' : ''}
                        onClick={() => setType('SURPLUS')}
                    >
                        Surplus Auctions
                    </Tab>
                </Switcher>

                {hide ? null : (
                    <AuctionsFAQ hideFAQ={handleHideFAQ} type={type} />
                )}
                <AuctionsList type={type} />
            </GridContainer>
        </>
    )
}

export default Auctions

const Content = styled.div`
    position: relative;
    button {
        position: absolute;
        top: 15px;
        right: 0px;
        min-width: auto;
        padding: 2px 10px;
        border-radius: 25px;
        font-size: 14px;
        background: linear-gradient(225deg, #4ce096 0%, #78d8ff 100%);
    }
`

const Switcher = styled.div`
    display: flex;
    align-items: 'center';
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    background: #34496c;
    max-width: 600px;
    margin: 40px auto;
    padding: 10px;
`

const Tab = styled.div`
    background: transparent;
    flex: 1;
    text-align: center;
    padding: 10px;
    cursor: pointer;
    border-radius: ${(props) => props.theme.global.borderRadius};
    color: ${(props) => props.theme.colors.neutral};
    &.active {
        background: ${(props) => props.theme.colors.gradient};
    }
`
