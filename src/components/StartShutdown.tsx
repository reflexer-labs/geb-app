import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Button from './Button';
import AlertLabel from './AlertLabel';
import { useStoreActions } from '../store';

const StartShutdown = () => {
  const { t } = useTranslation();
  const { popupsModel: popupsActions } = useStoreActions((state) => state);

  const handleStartShutdown = () =>
    popupsActions.setESMOperationPayload({
      isOpen: true,
      type: 'ES',
    });
  return (
    <Container>
      <Head>
        <TitleContainer>
          <Title>{t('emergency_shutdown')}</Title>
          <Date>{t('date')}: N/A</Date>
        </TitleContainer>
        <AlertContainer>
          <AlertLabel
            text={'50,000 FLX'}
            type={'danger'}
            padding={'4px 16px'}
          />
        </AlertContainer>
      </Head>

      <Desc>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Elit quis donec
        in in mauris. Ut tortor id eget est, tellus vestibulum consectetur ac
        id. Duis massa curabitur mauris, lobortis.
      </Desc>
      <BtnContainer>
        <Button
          text={t('start_shutdown')}
          onClick={handleStartShutdown}
          withArrow
        />
      </BtnContainer>
    </Container>
  );
};

export default StartShutdown;

const Container = styled.div`
  padding: 20px 20px 15px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.global.borderRadius};
  background: ${(props) => props.theme.colors.background};
  margin-bottom: 15px;
`;

const Title = styled.div`
  letter-spacing: -0.33px;
  line-height: 22px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
  font-size: ${(props) => props.theme.font.medium};
`;

const Date = styled.div`
  letter-spacing: 0.01px;
  margin-top: 3px;
  line-height: 18px;
  font-size: ${(props) => props.theme.font.extraSmall};
  color: ${(props) => props.theme.colors.secondary};
`;

const Desc = styled.div`
  margin-top: 5px;
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.secondary};
  letter-spacing: -0.18px;
  line-height: 24px;
`;

const BtnContainer = styled.div`
  margin-top: 5px;
  display: flex;
  justify-content: flex-end;
`;

const TitleContainer = styled.div``;

const Head = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const AlertContainer = styled.div`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin:10px 0 5px 0;
  `}
`;
