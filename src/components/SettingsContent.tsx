import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useStoreActions, useStoreState } from '../store'
import { langOptions } from '../utils/i18n'
import { LangOption } from '../utils/interfaces'
import Dropdown from './Dropdown'
import SwitchButton from './SwitchButton'

const SettingsContent = () => {
    const { t } = useTranslation()
    const { settingsModel: settingsState } = useStoreState((state) => state)
    const { settingsModel: settingsActions } = useStoreActions((state) => state)

    const { lang } = settingsState

    const [selectedLang, setSelectedLang] = useState('')
    const [langs] = useState(langOptions.map((lang: LangOption) => lang.name))

    const getSelectedLanguage = (lang: string) => {
        const filteredLang = langOptions.find(
            (language: LangOption) => language.name === lang
        )
        if (filteredLang) {
            setSelectedLang(filteredLang.name)
            settingsActions.setLang(filteredLang.code)
        }
    }

    const switchState = (state: boolean) => {
        settingsActions.setIsLightTheme(!state)
    }

    useEffect(() => {
        const filteredLang = langOptions.find(
            (language: LangOption) => language.code === lang
        )
        if (filteredLang) {
            setSelectedLang(filteredLang.name)
        }
    }, [lang])

    return (
        <>
            <Dropdown
                itemSelected={selectedLang ? selectedLang : langs[0]}
                items={langs}
                label={t('language')}
                getSelectedItem={getSelectedLanguage}
            />

            <SwitchContainer>
                {t('toggle_dark_mode')}
                <SwitchButton
                    state={settingsState.isLightTheme}
                    getState={switchState}
                />
            </SwitchContainer>
        </>
    )
}

export default SettingsContent

const SwitchContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
    font-size: ${(props) => props.theme.font.small};
`
