import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useStoreActions } from '../../store'
import Button from '../Button'
import Dropdown from '../Dropdown'
import { useUserCampaigns } from '../../hooks/useIncentives'

const MigrateBox = () => {
    const [migrate, setMigrate] = useState({ from: '', to: '' })
    const [error, setError] = useState('')

    const { t } = useTranslation()

    const userCampaigns = useUserCampaigns()

    const returnStakedIncentives = useCallback(() => {
        if (userCampaigns[0].campaignAddress !== '') {
            return userCampaigns.filter(
                (campaign) => Number(campaign.stakedBalance) > 0
            )
        }
        return userCampaigns
    }, [userCampaigns])

    const returnToCampaigns = useCallback(() => {
        if (userCampaigns[0].campaignAddress !== '') {
            if (!migrate.from) {
                return userCampaigns.filter(
                    (campaign) =>
                        campaign.campaignAddress !==
                        returnStakedIncentives()[
                            returnStakedIncentives().length - 1
                        ].campaignAddress
                )
            }

            return userCampaigns.filter(
                (campaign) => campaign.campaignAddress !== migrate.from
            )
        }
        return userCampaigns
    }, [migrate.from, returnStakedIncentives, userCampaigns])

    const {
        incentivesModel: incentivesActions,
        popupsModel: popupsActions,
    } = useStoreActions((state) => state)

    const handleCancel = () => {
        popupsActions.setIsIncentivesModalOpen(false)
        incentivesActions.setOperation(0)
    }

    const handleSelectedItem = (selected: string, isFrom = true) => {
        const id = selected.split('#').pop()
        if (userCampaigns.length > 0) {
            const selectedCampaign = userCampaigns.find(
                (campaign) => campaign.campaignNumber === id
            )
            if (selectedCampaign) {
                if (isFrom) {
                    setMigrate({
                        ...migrate,
                        from: selectedCampaign.campaignAddress,
                    })
                } else {
                    setMigrate({
                        ...migrate,
                        to: selectedCampaign.campaignAddress,
                    })
                }
            }
        }
    }

    const handleSubmit = () => {
        let { from, to } = migrate

        if (!from) {
            from = returnStakedIncentives()[returnStakedIncentives().length - 1]
                .campaignAddress
        }
        if (!to) {
            to = returnToCampaigns()[0].campaignAddress
        }
        if (from === to) {
            setError('Cannot migrate to the same campaign')
            return
        }
        setMigrate({ from, to })
        incentivesActions.setMigration({ from, to })
        incentivesActions.setOperation(3)
    }

    return (
        <Body>
            <DropdownContainer>
                <Dropdown
                    items={returnStakedIncentives().map(
                        (campaign) => `#${campaign.campaignNumber}`
                    )}
                    getSelectedItem={(selected: string) =>
                        handleSelectedItem(selected)
                    }
                    itemSelected={`#${
                        returnStakedIncentives()[
                            returnStakedIncentives().length - 1
                        ].campaignNumber
                    }`}
                    label={'Migrate From'}
                />
            </DropdownContainer>

            <DropdownContainer>
                <Dropdown
                    items={returnToCampaigns().map(
                        (campaign) => `#${campaign.campaignNumber}`
                    )}
                    getSelectedItem={(selected: string) =>
                        handleSelectedItem(selected, false)
                    }
                    itemSelected={`#${returnToCampaigns()[0].campaignNumber}`}
                    label={'Migrate To'}
                />
            </DropdownContainer>

            {error && <Error>{error}</Error>}

            <Footer>
                <Button dimmed text={t('cancel')} onClick={handleCancel} />
                <Button
                    withArrow
                    onClick={handleSubmit}
                    text={t('review_transaction')}
                />
            </Footer>
        </Body>
    )
}

export default MigrateBox

const Body = styled.div`
    padding: 20px;
`

const Footer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 20px 0 0 0;
`

const DropdownContainer = styled.div`
    margin-bottom: 30px;
`

const Error = styled.p`
    color: ${(props) => props.theme.colors.dangerColor};
    font-size: ${(props) => props.theme.font.extraSmall};
    width: 100%;
    margin: 16px 0;
`
