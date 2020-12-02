import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../store';
import Brand from './Brand';
import Button from './Button';
import { newTransactionsFirst, returnWalletAddress } from '../utils/helper';
import { useWeb3React } from '@web3-react/core';
import { isTransactionRecent } from '../hooks/TransactionHooks';
import NavLinks from './NavLinks';

const Navbar = () => {
  const { transactionsModel: transactionsState } = useStoreState(
    (state) => state
  );

  const { transactions } = transactionsState;

  const { popupsModel: popupsActions } = useStoreActions((state) => state);
  const { active, account } = useWeb3React();

  const handleWalletConnect = () => {
    if (active && account) {
      return popupsActions.setIsConnectedWalletModalOpen(true);
    }
    return popupsActions.setIsConnectorsWalletOpen(true);
  };

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(transactions);
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
  }, [transactions]);

  const pending = sortedRecentTransactions
    .filter((tx) => !tx.receipt)
    .map((tx) => tx.hash);

  const hasPendingTransactions = !!pending.length;
  return (
    <Container>
      <Left>
        <Brand />
      </Left>
      <HideMobile>
        <NavLinks />
      </HideMobile>
      <RightSide>
        <BtnContainer>
          <Button
            isLoading={hasPendingTransactions}
            onClick={handleWalletConnect}
            text={
              active && account
                ? hasPendingTransactions
                  ? `${pending.length} Pending`
                  : returnWalletAddress(account)
                : 'connect_wallet'
            }
          />
        </BtnContainer>

        {/* <MenuBtn onClick={() => popupsActions.setShowSideMenu(true)}>
          <RectContainer>
            <Rect />
            <Rect />
            <Rect />
          </RectContainer>
        </MenuBtn> */}
      </RightSide>
    </Container>
  );
};

export default Navbar;

const Container = styled.div`
  display: flex;
  height: 68px;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0px 1px 0px #eef3f9;
  padding: 0 40px;
  margin-bottom: 10px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.background};
  ${({ theme }) => theme.mediaWidth.upToSmall`
     padding: 0 20px;
  `}
`;

// const MenuBtn = styled.div`
//   margin-right: -20px;
//   width: 60px;
//   height: 60px;
//   align-items: center;
//   justify-content: center;
//   display: none;
//   border-left: 1px solid ${(props) => props.theme.colors.border};
//   cursor: pointer;
//   &:hover {
//     div {
//       div {
//         background: ${(props) => props.theme.colors.gradient};
//       }
//     }
//   }
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     display: flex;
//   `}
// `;

const BtnContainer = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}

  svg {
    stroke: white;
    position: relative;
    top: 2px;
    margin-right: 5px;
  }
`;

// const RectContainer = styled.div``;

// const Rect = styled.div`
//   width: 15px;
//   border-radius: 12px;
//   height: 3px;
//   margin-bottom: 2px;
//   background: ${(props) => props.theme.colors.secondary};
//   transition: all 0.3s ease;
//   &:last-child {
//     margin-bottom: 0;
//   }
// `;

const RightSide = styled.div`
  display: flex;
  align-items: center;
`;

const HideMobile = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`;

const Left = styled.div`
  min-width: 194px;
  display: flex;
  align-items: center;
`;
