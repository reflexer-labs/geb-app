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

const Auctions = () => {
    const { t } = useTranslation()
    const history = useHistory()
    const { account } = useActiveWeb3React()
    const { auctionsModel: auctionsActions } = useStoreActions((state) => state)
    const { settingsModel: settingsState } = useStoreState((state) => state)

    const { isRPCAdapterOn } = settingsState

    const [hide, setHide] = useState(false)

    const handleHideFAQ = () => setHide(!hide)

    useEffect(() => {
        if (isRPCAdapterOn) {
            history.push('/')
        }

        async function fetchIncentivesCampaigns() {
            await auctionsActions.fetchAuctions({
                address: account ? account : '',
            })
        }
        fetchIncentivesCampaigns()
        const interval = setInterval(() => {
            fetchIncentivesCampaigns()
        }, 2000)

        return () => clearInterval(interval)
    }, [account, auctionsActions, history, isRPCAdapterOn])

    return (
        <>
            <GridContainer>
                <Content>
                    <PageHeader
                        breadcrumbs={{ '/': t('auctions') }}
                        text={t('auctions_header_text')}
                    />
                    {hide ? (
                        <Button text={t('show_faq')} onClick={handleHideFAQ} />
                    ) : null}
                </Content>

                {hide ? null : <AuctionsFAQ hideFAQ={handleHideFAQ} />}
                <AuctionsList />
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
