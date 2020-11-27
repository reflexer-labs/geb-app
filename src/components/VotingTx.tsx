import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import AlertLabel from './AlertLabel';
import { Link } from 'react-router-dom';
import { IVotingTx } from '../utils/interfaces';
import Arrow from './Icons/Arrow';

interface Props {
  tx: IVotingTx;
}

const VotingTx = ({ tx }: Props) => {
  const { t } = useTranslation();

  const returnAlert = () => {
    if (tx.isCompleted && tx.isAbandoned) {
      return (
        <AlertLabel text={'Abandoned'} type={'dimmed'} padding={'4px 16px'} />
      );
    } else if (tx.isCompleted) {
      return (
        <AlertLabel text={'Completed'} type={'gradient'} padding={'4px 16px'} />
      );
    } else {
      return (
        <AlertLabel
          text={'Scheduled for ' + tx.endsIn}
          type={'danger'}
          padding={'4px 16px'}
        />
      );
    }
  };
  return (
    <Container>
      <Head>
        <TitleContainer>
          <Title>{tx.title}</Title>
          <Date>{tx.date}</Date>
        </TitleContainer>
        <AlertContainer>{returnAlert()}</AlertContainer>
      </Head>

      {tx.text ? <Desc>{tx.text}</Desc> : null}

      <BtnContainer className={tx.isCompleted ? 'disabled' : ''}>
        <Link to={`/voting/${tx.id}`}>
          <span>{t('delay_transaction')}</span>
          <Arrow />
        </Link>
      </BtnContainer>
    </Container>
  );
};

export default VotingTx;

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

const TitleContainer = styled.div``;

const Head = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
   flex-direction: column;
   justify-content: flex-start;
  `}
`;

const AlertContainer = styled.div`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin:10px 0 5px 0;
    width:fit-content;
  `}
`;

const BtnContainer = styled.div`
  display: flex;
  margin-top: 10px;
  justify-content: flex-end;
  a {
    svg {
      float: right;
      position: relative;
      top: 7px;
    }
    border: 0;
    cursor: pointer;
    box-shadow: none;
    outline: none;
    padding: 0;
    margin: 0;
    background: ${(props) => props.theme.colors.gradient};
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: ${(props) => props.theme.colors.inputBorderColor};
    font-size: ${(props) => props.theme.font.small};
    font-weight: 600;
    line-height: 24px;
    letter-spacing: -0.18px;
  }

  &.disabled {
    pointer-events: none;
    cursor: not-allowed;
    a {
      pointer-events: none;
      cursor: not-allowed;
      color: ${(props) => props.theme.colors.secondary};
      background-clip: none !important;
      -webkit-background-clip: none !important;
      -webkit-text-fill-color: ${(props) => props.theme.colors.secondary};
      background: none !important;
      img {
        filter: grayscale(100%);
      }
    }
  }
`;
