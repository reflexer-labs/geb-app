import React, { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import { utils as gebUtils } from 'geb.js';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../../store';
import { COIN_TICKER } from '../../utils/constants';
import Button from '../Button';
import CheckBox from '../CheckBox';
import DecimalInput from '../DecimalInput';
import Dropdown from '../Dropdown';
import { formatNumber, toFixedString } from '../../utils/helper';
import { NETWORK_ID } from '../../connectors';
import Results from './Results';
import useIncentives from '../../hooks/useIncentives';

const INITITAL_STATE = [
  {
    item: 'Uniswap',
    img: require('../../assets/uni-icon.svg'),
  },
  { item: 'RAI/ETH', img: require('../../assets/rai.png') },
];

interface Props {
  isChecked?: boolean;
}

const IncentivesPayment = ({ isChecked }: Props) => {
  const { t } = useTranslation();
  const { token0, token1Price, token0Price, coinAddress } = useIncentives();
  const [ethAmount, setEthAmount] = useState('');
  const [raiAmount, setRaiAmount] = useState('');
  const [error, setError] = useState('');
  const [uniPool, setUniPool] = useState('');
  const [cashRewardsCheck, setCashRewardsCheck] = useState(false);
  const [leaveLiquidity, setLeaveLiquidity] = useState(isChecked || false);

  const {
    incentivesModel: incentivesState,
    connectWalletModel: connectWalletState,
  } = useStoreState((state) => state);

  const {
    incentivesModel: incentivesActions,
    popupsModel: popupsActions,
  } = useStoreActions((state) => state);

  const { type, incentivesFields } = incentivesState;

  const ethBalance = connectWalletState.ethBalance[NETWORK_ID];
  const praiBalance = connectWalletState.praiBalance[NETWORK_ID];

  const validationChecker = () => {
    if (type === 'deposit') {
      const ethAmountBN = ethAmount
        ? BigNumber.from(toFixedString(ethAmount, 'WAD'))
        : BigNumber.from('0');
      const raiAmountBN = raiAmount
        ? BigNumber.from(toFixedString(raiAmount, 'WAD'))
        : BigNumber.from('0');

      const ethBalanceBN = ethBalance
        ? BigNumber.from(toFixedString(ethBalance.toString(), 'WAD'))
        : BigNumber.from('0');

      const praiBalanceBN = praiBalance
        ? BigNumber.from(toFixedString(praiBalance.toString(), 'WAD'))
        : BigNumber.from('0');

      if (
        ethAmountBN.isZero() ||
        raiAmountBN.isZero() ||
        (ethAmountBN.isZero() && raiAmountBN.isZero)
      ) {
        setError(
          `Please enter the amount of ETH/${COIN_TICKER} to be deposited`
        );
        return;
      }
      if (ethAmountBN.gt(ethBalanceBN)) {
        setError(`Deposited ETH cannot exceed available amount.`);
        return;
      }
      if (raiAmountBN.gt(praiBalanceBN)) {
        setError(`Deposited ${COIN_TICKER} cannot exceed available amount.`);
        return;
      }
    }

    return true;
  };

  const handleCancel = () => {
    popupsActions.setIsIncentivesModalOpen(false);
    incentivesActions.setOperation(0);
  };

  const passedCheckForCoinAllowance = () => {
    const coinAllowance = connectWalletState.coinAllowance;
    const raiAmountBN = raiAmount
      ? BigNumber.from(toFixedString(raiAmount, 'WAD'))
      : BigNumber.from('0');
    if (coinAllowance) {
      const coinAllowanceBN = BigNumber.from(
        toFixedString(coinAllowance, 'WAD')
      );
      return coinAllowanceBN.gte(raiAmountBN);
    }
    return false;
  };

  const handleSubmit = () => {
    const isPassedValidation = validationChecker();
    if (isPassedValidation) {
      if (leaveLiquidity) {
        incentivesActions.setOperation(1);
      } else if (type === 'deposit' && !passedCheckForCoinAllowance()) {
        incentivesActions.setOperation(2);
      } else {
        incentivesActions.setOperation(3);
      }
    }
  };

  const handleLeaveLiquidityCheck = (state: boolean) => {
    setLeaveLiquidity(state);
    incentivesActions.setIsLeaveLiquidityChecked(state);
  };

  const handleChange = (val: string, isEth = true) => {
    setError('');
    if (!val) {
      setEthAmount('');
      setRaiAmount('');
      incentivesActions.setIncentivesFields({
        raiAmount: '',
        ethAmount: '',
      });
      return;
    }
    if (!coinAddress || !token0) return;

    let praiValue: string;

    if (isEth) {
      praiValue = coinAddress === token0 ? token0Price : token1Price;
    } else {
      praiValue = coinAddress === token0 ? token1Price : token0Price;
    }

    const valueBN = BigNumber.from(toFixedString(val, 'WAD'));
    const praiValueBN = BigNumber.from(toFixedString(praiValue, 'RAD')).div(
      gebUtils.RAY
    );

    const reflectValue = gebUtils
      .wadToFixed(valueBN.mul(praiValueBN).div(gebUtils.WAD))
      .toString();

    const raiVal = isEth ? reflectValue : val;
    const ethVal = isEth ? val : reflectValue;

    incentivesActions.setIncentivesFields({
      raiAmount: raiVal,
      ethAmount: ethVal,
    });
    setRaiAmount(raiVal);
    setEthAmount(ethVal);
  };

  useEffect(() => {
    setEthAmount(incentivesFields.ethAmount);
    setRaiAmount(incentivesFields.raiAmount);
  }, [incentivesFields]);

  return (
    <Body>
      <DoubleDropdown>
        <Dropdown
          items={[]}
          itemSelected={INITITAL_STATE[0]}
          label={'DEX'}
          padding={'22px 20px'}
        />
        <Dropdown
          items={[]}
          itemSelected={INITITAL_STATE[1]}
          label={'Pair'}
          padding={'22px 20px'}
        />
      </DoubleDropdown>

      {incentivesState.type === 'withdraw' ? (
        <SingleInput>
          <DecimalInput
            label={`UNI Pool Tokens (Avail 0)`}
            value={uniPool}
            onChange={setUniPool}
            disableMax
          />
        </SingleInput>
      ) : (
        <DoubleInput>
          <DecimalInput
            label={`${incentivesState.type} ETH (Avail ${formatNumber(
              ethBalance.toString()
            )})`}
            value={ethAmount}
            onChange={handleChange}
            handleMaxClick={() => handleChange(ethBalance.toString())}
          />
          <DecimalInput
            label={`${
              incentivesState.type
            } ${COIN_TICKER} (Avail ${formatNumber(praiBalance.toString())})`}
            value={raiAmount}
            onChange={(val: string) => handleChange(val, false)}
            handleMaxClick={() => handleChange(praiBalance.toString(), false)}
          />
        </DoubleInput>
      )}
      {error && <Error>{error}</Error>}

      <Results />

      {incentivesState.type === 'withdraw' ? (
        <>
          <CheckBoxcontainer>
            <Text>{t('checkout_rewards')}</Text>
            <CheckBox
              checked={cashRewardsCheck}
              onChange={setCashRewardsCheck}
            />
          </CheckBoxcontainer>
          <CheckBoxcontainer className={'adjust-margin'}>
            <Text>{t('leave_liquidity')}</Text>
            <CheckBox
              checked={leaveLiquidity}
              onChange={handleLeaveLiquidityCheck}
            />
          </CheckBoxcontainer>
        </>
      ) : null}
      <Footer>
        <Button dimmed text={t('cancel')} onClick={handleCancel} />
        <Button
          withArrow
          onClick={handleSubmit}
          text={t(leaveLiquidity ? 'pool_tokens' : 'review_transaction')}
        />
      </Footer>
    </Body>
  );
};

export default IncentivesPayment;

const Body = styled.div`
  padding: 20px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 0 0 0;
`;

const DoubleDropdown = styled.div`
  display: flex;
  margin-bottom: 20px;
  > div {
    &:last-child {
      flex: 0 0 calc(50% + 5px);
      margin-left: -5px;
    }
    &:first-child {
      flex: 0 0 50%;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    > div {
      flex: 0 0 100%;
      max-width: 100%;
      &:last-child {
        margin-left: 0;
        margin-top: 20px;
      }
    }
  `}
`;

const DoubleInput = styled.div`
  display: flex;
  margin-bottom: 20px;
  > div {
    &:last-child {
      flex: 0 0 calc(50% + 5px);
      margin-left: -5px;
    }
    &:first-child {
      flex: 0 0 50%;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    > div {
      flex: 0 0 100%;
      max-width: 100%;
      &:last-child {
        margin-left: 0;
        margin-top: 20px;
      }
    }
  `}
`;

const CheckBoxcontainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  &.adjust-margin {
    margin-top: 5px;
  }
`;

const Text = styled.div`
  line-height: 18px;
  letter-spacing: -0.18px;
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.extraSmall};
`;

const SingleInput = styled.div`
  margin: 20px 0;
`;

const Error = styled.p`
  color: ${(props) => props.theme.colors.dangerColor};
  font-size: ${(props) => props.theme.font.extraSmall};
  width: 100%;
  margin: 16px 0;
`;
