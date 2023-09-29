import styled from 'styled-components'
import { useStoreActions, useStoreState } from '../../store'
import Modal from './Modal'
import { AlertTriangle } from 'react-feather'
import { ExternalLinkArrow } from 'src/GlobalStyle'
import Button from '../Button'

const BlockedCountriesModal = () => {
    const { popupsModel: popupsState } = useStoreState((state) => state)
    const { popupsModel: popupsActions } = useStoreActions((state) => state)
    const handleClick = () => {
        popupsActions.setIsConnectorsWalletOpen(true)
        popupsActions.setIsBlockedCountriesModalOpen(false)
    }
    return (
        <Modal
            width={'350px'}
            backDropClose={false}
            isModalOpen={popupsState.isBlockedCountriesModalOpen}
            borderRadius={'20px'}
            handleModalContent
            showXButton={false}
            id="blocked-countries"
        >
            <Container>
                <AlertTriangle size={40} color={'orange'} />
                <Text>
                    You are prohibited from accessing this UI from the{' '}
                    <b>United Kingdom</b>{' '}
                    <a
                        href={
                            'https://www.fca.org.uk/publication/correspondence/final-warning-cryptoasset-firms-marketing-consumers.pdf'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {'Read more'}
                    </a>{' '}
                    or{' '}
                    <Button
                        withArrow
                        text="Withdraw your funds"
                        onClick={handleClick}
                    />
                </Text>
            </Container>
        </Modal>
    )
}

export default BlockedCountriesModal

const Container = styled.div`
    background: ${(props) => props.theme.colors.background};
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};

    padding: 40px;
    text-align: center;
    a {
        ${ExternalLinkArrow}
        font-size: ${(props) => props.theme.font.default};
    }
`

const Text = styled.div`
    font-size: ${(props) => props.theme.font.default};
    margin-top: 20px;
    margin-bottom: 20px;
`
