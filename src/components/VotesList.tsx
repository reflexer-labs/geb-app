import React, { useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import { useStoreActions } from '../store';
import { returnWalletAddress } from '../utils/helper';
import Button from './Button';

interface IVote {
  address: string;
  votes: number;
}

const randNumber = () => Math.floor(Math.random()) + Math.random() * 20000 + 3;

const INITITAL_STATE = [
  {
    address: '0x15fb0C704C855fD16e23Ae90131fF6232F9a31C8',
    votes: randNumber(),
  },
  {
    address: '0xf3BF66D6c8f425eD0Dc2B3842401fe17eC459Af3',
    votes: randNumber(),
  },

  {
    address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    votes: randNumber(),
  },

  {
    address: '0x6C5CCF22147A96e27855E26bC6824EB76497D112',
    votes: randNumber(),
  },

  {
    address: '0x6B421f44f4887D9a50c3898E71cE05C46A230B5A',
    votes: randNumber(),
  },

  {
    address: '0x97C58FB5102036Bf7294aeb7383f04e18209e4b4',
    votes: randNumber(),
  },

  {
    address: '0xF9c78A9F8714DF96850A4EFbc9988F85f3dBFd40',
    votes: randNumber(),
  },
];

const VotesList = () => {
  const { t } = useTranslation();
  const [votesList] = useState<Array<IVote>>(INITITAL_STATE);
  const [listHeight, setListHeight] = useState('170px');
  const [showMore, setShowMore] = useState(false);
  const { popupsModel: popupsActions } = useStoreActions((state) => state);
  const returnSum = (list: Array<IVote>) => {
    return list.reduce((acc, v) => acc + v.votes, 0);
  };

  const returnPercentage = (votes: number) => votes / returnSum(votesList);

  const handleShowMore = () => {
    if (showMore) {
      setListHeight('170px');
    } else {
      setListHeight('340px');
    }
    setShowMore(!showMore);
  };
  return (
    <Container>
      <Header>
        <Title>{t('votes')}</Title>
        <Sum>{returnSum(votesList).toFixed(3)}</Sum>
      </Header>
      <List style={{ height: listHeight }}>
        <Scrollbars
          autoHeightMin={'170px'}
          renderView={({ style, ...props }) => (
            <div
              {...props}
              style={{
                ...(showMore ? style : {}),
              }}
            />
          )}
        >
          {votesList.length > 0
            ? votesList
                .sort((a, b) => b.votes - a.votes)
                .map((vote: IVote) => (
                  <ListeItem key={vote.address}>
                    <UpperSection>
                      <Address>{returnWalletAddress(vote.address)}</Address>
                      <Votes>{vote.votes.toFixed(2)}</Votes>
                    </UpperSection>
                    <VotesPercentage size={returnPercentage(vote.votes)} />
                  </ListeItem>
                ))
            : null}
        </Scrollbars>
      </List>

      <BtnContainer>
        <Button
          text={showMore ? t('show_less') : t('show_more')}
          onClick={handleShowMore}
          dimmed
        />
        <Button
          withArrow
          onClick={() => popupsActions.setIsVotingModalOpen(true)}
          text={t('submit_vote')}
        />
      </BtnContainer>
    </Container>
  );
};

export default VotesList;

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
const Sum = styled.div`
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

const Address = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.secondary};
`;

const Votes = styled.div`
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

const VotesPercentage = styled.div<{ size?: number }>`
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
