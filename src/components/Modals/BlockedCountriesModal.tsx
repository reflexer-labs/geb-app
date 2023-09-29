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

    const handleClose = () => {
        popupsActions.setIsBlockedCountriesModalOpen(false)
    }
    return (
        <Modal
            width={'450px'}
            backDropClose={false}
            isModalOpen={popupsState.isBlockedCountriesModalOpen}
            closeModal={handleClose}
            borderRadius={'20px'}
            showXButton
            id="blocked-countries"
        >
            <Container>
                <AlertTriangle size={40} color={'orange'} />
                <Text>
                    You cannot interact with the Reflexer app from the{' '}
                    <b>United Kingdom</b>{' '}
                    <a
                        href={
                            'https://www.fca.org.uk/publication/correspondence/final-warning-cryptoasset-firms-marketing-consumers.pdf'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {'Read more here.'}
                    </a>
                    <br />
                    You can use this UI to{' '}
                    <Button
                        withArrow
                        text="withdraw"
                        onClick={handleClick}
                    />{' '}
                    your assets from the RAI protocol.{' '}
                </Text>
            </Container>
        </Modal>
    )
}

export default BlockedCountriesModal

const Container = styled.div`
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
    img {
        display: none !important;
    }

    button {
        span {
            text-transform: lowercase !important;
        }
    }
`
