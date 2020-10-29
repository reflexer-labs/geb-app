import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import { useStoreActions } from '../store';
import Button from './Button';

const IncentivesList = () => {
  const { t } = useTranslation();
  const {
    popupsModel: popupsActions,
    incentivesModel: incentivesActions,
  } = useStoreActions((state) => state);

  const handleClick = (type: string) => {
    popupsActions.setIsIncentivesModalOpen(true);
    incentivesActions.setType(type);
  };
  return (
    <Container>
      <Header>
        <Title>{t('liquidity_mining')}</Title>
      </Header>
      <List>
        <ListeItem>
          <UpperSection>
            <Label>Pool Percentage</Label>
            <Value>(74.33%)</Value>
          </UpperSection>
          <Percentage size={0.74} />
        </ListeItem>

        <ListeItem>
          <UpperSection>
            <Label>Unlocked Rewards</Label>
            <Value>(14.67%)</Value>
          </UpperSection>
          <Percentage size={0.15} />
        </ListeItem>
      </List>

      <BtnContainer>
        <Button
          text={t('withdraw')}
          onClick={() => handleClick('withdraw')}
          dimmed
        />
        <Button
          withArrow
          onClick={() => handleClick('deposit')}
          text={t('deposit')}
        />
      </BtnContainer>
    </Container>
  );
};

export default IncentivesList;

const Container = styled.div`
  border: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.global.borderRadius};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const Title = styled.div`
  font-size: ${(props) => props.theme.font.medium};
  color: ${(props) => props.theme.colors.primary};
  font-weight: 600;
`;

const List = styled.div`
  overflow: hidden;
`;

const ListeItem = styled.div`
  padding: 12px 20px;
`;

const UpperSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Label = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.secondary};
`;

const Value = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.secondary};
`;

const fill = (width: string) => keyframes`
     0% {
        width :'0%'
    }
    100% {
       width: ${width}
    }

`;

const Percentage = styled.div<{ size?: number }>`
  margin-top: 10px;
  background: ${(props) => props.theme.colors.foreground};
  border-radius: 18px;
  height: 4px;
  position: relative;

  &:before {
    background: ${(props) => props.theme.colors.gradient};
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    border-radius: 18px;
    height: 4px;
    z-index: 1;
    width: 0;
    animation: ${(props) => fill(props.size ? props.size * 100 + '%' : '0%')}
      linear 0.5s;
    animation-fill-mode: forwards;
  }
`;

const BtnContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px 20px 20px;
`;
