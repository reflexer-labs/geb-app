import React, { useState } from 'react'
import { X } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import _ from '../utils/lodash'
import { useStoreState } from '../store'
import Button from './Button'

interface Props {
    title: string
    text: string
    stepNumber: number
    btnText: string
    handleClick: () => void
    isDisabled: boolean
    isLoading: boolean
}

const StepsContent = ({
    title,
    text,
    stepNumber,
    btnText,
    handleClick,
    isDisabled,
    isLoading,
}: Props) => {
    const { t } = useTranslation()
    const { safeModel: safeState } = useStoreState((state) => state)

    const [isOpen, setIsOpen] = useState(true)

    const debtFloorVal = _.get(safeState, 'debtFloor', '0')

    const handleOpenState = () => setIsOpen(!isOpen)

    return (
        <Container>
            <Title>{t(title)}</Title>
            <Text>
                {t(text)}{' '}
                {isOpen ? null : (
                    <ReadLink onClick={handleOpenState}>Show more</ReadLink>
                )}
            </Text>
            {isOpen ? (
                <Notes>
                    <CloseBtn onClick={handleOpenState}>
                        <X size="14" />
                    </CloseBtn>
                    <Heading>Important Notes</Heading>
                    <List>
                        <Item>{`You do not need to create a new account if you already have a MakerDAO or Balancer proxy`}</Item>
                        <Item>{`The minimum amount to mint per safe is ${debtFloorVal} RAI`}</Item>
                    </List>
                </Notes>
            ) : null}
            <Button
                id={stepNumber === 2 ? 'create-safe' : ''}
                disabled={isDisabled || isLoading}
                isLoading={isLoading}
                text={t(btnText)}
                onClick={handleClick}
            />
        </Container>
    )
}

export default StepsContent

const Container = styled.div`
    text-align: center;
    margin-top: 20px;
`

const Title = styled.div`
    font-size: ${(props) => props.theme.font.medium};
    font-weight: 600;
    color: ${(props) => props.theme.colors.primary};
    margin-bottom: 10px;
`

const Text = styled.div`
    font-size: ${(props) => props.theme.font.small};
    color: ${(props) => props.theme.colors.secondary};
    margin-bottom: 20px;
    line-height: 21px;
`

const Notes = styled.div`
    background: ${(props) => props.theme.colors.foreground};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: ${(props) => props.theme.global.borderRadius};
    padding: 20px;
    margin-bottom: 20px;
    position: relative;
`

const Heading = styled.div`
    font-size: 15px;
    text-align: center;
    font-weight: bold;
    color: ${(props) => props.theme.colors.secondary};
    margin-bottom: 15px;
`

const List = styled.ul`
    margin: 0;
    padding-left: 20px;
`

const Item = styled.li`
    font-size: ${(props) => props.theme.font.small};
    text-align: left;
    color: ${(props) => props.theme.colors.secondary};
    margin-top: 5px;
`

const CloseBtn = styled.div`
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
    svg {
        color: ${(props) => props.theme.colors.secondary};
    }
`

const ReadLink = styled.span`
    color: ${(props) => props.theme.colors.inputBorderColor};
    text-decoration: underline;
    cursor: pointer;
`
