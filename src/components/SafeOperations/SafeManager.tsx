import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { useStoreActions } from '../../store'
import Button from '../Button'
import DecimalInput from '../DecimalInput'

const SafeManager = () => {
    const { t } = useTranslation()
    const [error, setError] = useState('')
    const [value, setValue] = useState('')

    const history = useHistory()

    const {
        popupsModel: popupsActions,
        safeModel: safeActions,
    } = useStoreActions((state) => state)

    const handleCancel = () => {
        popupsActions.setIsSafeManagerOpen(false)
    }

    const handleSubmit = async () => {
        if (!value) {
            setError('Enter Safe ID')
            return
        }
        try {
            const safeData = await safeActions.fetchManagedSafe(value)
            if (safeData && !safeData.safes.length) {
                setError('Not a valid Safe ID')
                return
            }
            handleCancel()
            history.push(`/safes/${safeData.safes[0].safeId}`)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Body>
            <DecimalInput
                value={value}
                placeholder={'ie: 32'}
                label={'Safe ID'}
                onChange={setValue}
                disableMax
            />

            {error && <Error>{error}</Error>}

            <Footer>
                <Button dimmed text={t('cancel')} onClick={handleCancel} />
                <Button
                    withArrow
                    onClick={handleSubmit}
                    text={t('manage_safe')}
                />
            </Footer>
        </Body>
    )
}

export default SafeManager

const Body = styled.div`
    padding: 20px;
`

const Footer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 20px 0 0 0;
`

const Error = styled.p`
    color: ${(props) => props.theme.colors.dangerColor};
    font-size: ${(props) => props.theme.font.extraSmall};
    width: 100%;
    margin: 16px 0;
`
