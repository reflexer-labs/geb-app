import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import { useStoreActions } from '../../store';
import Button from '../Button';

interface Props {
  title?: string;
  children: React.ReactNode;
  submitBtnText?: string;
  handleSubmit?: () => void;
  maxWidth?: string;
  width?: string;
  isModalOpen: boolean;
  closeModal?: () => void;
  handleModalContent?: boolean;
  showXButton?: boolean;
  borderRadius?: string;
  backDropClose?: boolean;
}
const Modal = ({
  title,
  children,
  submitBtnText,
  handleSubmit,
  width,
  maxWidth,
  isModalOpen,
  closeModal,
  handleModalContent,
  showXButton,
  borderRadius,
  backDropClose,
}: Props) => {
  const { t } = useTranslation();

  const { settingsModel: settingsActions } = useStoreActions((state) => state);

  useEffect(() => {
    if (isModalOpen) {
      settingsActions.setBodyOverFlow(true);
    } else {
      settingsActions.setBodyOverFlow(false);
    }
    // eslint-disable-next-line
  }, [isModalOpen]);

  const handleBackdrop = () => {
    if (backDropClose && closeModal) {
      return closeModal();
    }
  };

  return isModalOpen ? (
    <CSSTransition
      in={isModalOpen}
      timeout={300}
      classNames="fade"
      appear={isModalOpen}
    >
      <Container>
        <InnerContent>
          <BackDrop onClick={handleBackdrop} />
          <ChildrenHolder
            style={{ maxWidth: maxWidth || '720px', width: width || '100%' }}
          >
            {handleModalContent ? (
              <>{children}</>
            ) : (
              <ModalContent
                style={{
                  width: width || '100%',
                  maxWidth: maxWidth || '720px',
                  borderRadius,
                }}
              >
                <HeaderContainer>
                  {<Header>{title ? t(title) : null}</Header>}
                  {showXButton ? (
                    <CloseBtn onClick={closeModal}>&times;</CloseBtn>
                  ) : null}
                </HeaderContainer>
                <Body>{children}</Body>

                {showXButton && !submitBtnText ? null : (
                  <Footer>
                    <Button dimmed onClick={closeModal} text={t('cancel')} />

                    {submitBtnText && handleSubmit ? (
                      <Button
                        withArrow
                        onClick={handleSubmit}
                        text={t(submitBtnText)}
                      />
                    ) : null}
                  </Footer>
                )}
              </ModalContent>
            )}
          </ChildrenHolder>
        </InnerContent>
      </Container>
    </CSSTransition>
  ) : null;
};

export default Modal;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  overflow-y: auto;
  &.fade-appear {
    opacity: 0;
  }
  &.fade-appear-active {
    opacity: 1;
    transition: all 300ms;
  }
`;

const InnerContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  position: relative;

  @media (max-width: 768px) {
    padding: 50px 20px;
  }
`;

const ModalContent = styled.div`
  background: ${(props) => props.theme.modalBg};
  border-radius: ${(props) => props.theme.buttonBorderRadius};
  border: 1px solid ${(props) => props.theme.borderColor};
`;

const Header = styled.div`
  padding: 20px;
  font-size: ${(props) => props.theme.modalFontSize};
  font-weight: 600;
  color: ${(props) => props.theme.darkText};
  letter-spacing: -0.47px;
`;

const Body = styled.div`
  padding: 20px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${(props) => props.theme.borderColor};
`;

const CloseBtn = styled.button`
  cursor: pointer;
  border: none;
  box-shadow: none;
  outline: none;
  background: transparent;
  border-radius: 0;
  color: #a4abb7;
  font-size: 30px;
  font-weight: 600;
  line-height: 24px;
  padding: 0;
  margin: 5px 20px 0 0;
`;

const BackDrop = styled.div`
  background: ${(props) => props.theme.modalOverlay};
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

const ChildrenHolder = styled.div`
  position: relative;
  z-index: 2;
`;
