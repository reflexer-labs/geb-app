// eslint-disable-next-line no-restricted-imports
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/macro'
import { ResizingTextArea } from './TextAreaInput'

const SubHeader = styled.div`
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.secondary};
    margin-bottom: 10px;
    margin-top: 20px;
`
const CustomInput = styled.input`
    font-size: ${(props) => props.theme.font.default};
    transition: all 0.3s ease;
    width: 100%;
    padding: 20px;
    background: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.primary};
    line-height: 24px;
    outline: none;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 10px;
    transition: all 0.3s ease;
`

const ProposalEditorContainer = styled.div``

const AreaContainer = styled.div`
    padding: 1.2rem;
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: ${({ theme }) => theme.colors.background};
`

export const ProposalEditor = ({
    className,
    title,
    body,
    onTitleInput,
    onBodyInput,
}: {
    className?: string
    title: string
    body: string
    onTitleInput: (title: string) => void
    onBodyInput: (body: string) => void
}) => {
    const { t } = useTranslation()
    const bodyPlaceholder = `## Summary

Insert your summary here

## Methodology
  
Insert your methodology here

## Conclusion
  
Insert your conclusion here
  
  `

    return (
        <ProposalEditorContainer className={className}>
            <SubHeader>{t('proposal_title')}</SubHeader>
            <CustomInput
                id="topup_input"
                value={title}
                placeholder={t(`enter_proposal_title`)}
                onChange={(e) => onTitleInput(e.target.value)}
            />
            <SubHeader>{t('proposal_description')}</SubHeader>
            <AreaContainer>
                <ResizingTextArea
                    value={body}
                    onUserInput={onBodyInput}
                    placeholder={bodyPlaceholder}
                    fontSize="1rem"
                />
            </AreaContainer>
        </ProposalEditorContainer>
    )
}
