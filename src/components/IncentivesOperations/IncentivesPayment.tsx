import React, { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import { utils as gebUtils } from 'geb.js';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../../store';
import { COIN_TICKER } from '../../utils/constants';
import Button from '../Button';
import DecimalInput from '../DecimalInput';
import Dropdown from '../Dropdown';
import { formatNumber, toFixedString } from '../../utils/helper';
import { NETWORK_ID } from '../../connectors';
import Results from './Results';
import {
  useIncentivesAssets,
  useSelectedCampaign,
} from '../../hooks/useIncentives';
import _ from '../../utils/lodash';
import CheckBox from '../CheckBox';

const INITITAL_STATE = [
  {
    item: 'Uniswap',
    img: require('../../assets/uni-icon.svg'),
  },
  { item: 'RAI/ETH', img: require('../../assets/rai.png') },
];

const IncentivesPayment = ({ isChecked }: { isChecked: boolean }) => {
  const { t } = useTranslation();
  const {
    token0,
    token1Price,
    token0Price,
    coinAddress,
    stakedBalance,
    campaignAddress,
  } = useSelectedCampaign();

  const assets = useIncentivesAssets();

  const [isUniSwapChecked, setIsUniSwapChecked] = useState(isChecked || false);

  const [ethAmount, setEthAmount] = useState('');
  const [raiAmount, setRaiAmount] = useState('');
  const [error, setError] = useState('');
  const [uniPool, setUniPool] = useState('');
  const [uniShare, setUniShare] = useState('');

  const {
    incentivesModel: incentivesState,
    connectWalletModel: connectWalletState,
  } = useStoreState((state) => state);

  const {
    incentivesModel: incentivesActions,
    popupsModel: popupsActions,
  } = useStoreActions((state) => state);

  const {
    type,
    incentivesFields,
    uniPoolAmount,
    uniswapShare,
  } = incentivesState;

  const ethBalance = connectWalletState.ethBalance[NETWORK_ID];
  const raiBalance = _.get(
    incentivesState.incentivesCampaignData,
    'raiBalance',
    '0'
  );

  const uniCoinLpAllowance = _.get(
    incentivesState,
    'incentivesCampaignData.proxyData.uniCoinLpAllowance.amount',
    '0'
  );

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

      const raiBalanceBN = raiBalance
        ? BigNumber.from(toFixedString(raiBalance.toString(), 'WAD'))
        : BigNumber.from('0');

      const uniShareBN = uniShare
        ? BigNumber.from(toFixedString(uniShare.toString(), 'WAD'))
        : BigNumber.from('0');

      const uniShareBalanceBN = assets?.uni.amount
        ? BigNumber.from(toFixedString(assets?.uni.amount.toString(), 'WAD'))
        : BigNumber.from('0');

      if (isUniSwapChecked) {
        if (uniShareBN.isZero()) {
          setError(`Please enter the amount of uniswap share to be deposited`);
          return;
        }
        if (!uniShareBN.isZero() && uniShareBN.gt(uniShareBalanceBN)) {
          setError(`Deposited Uniswap share cannot exceed available amount.`);
          return;
        }
      }

      if (
        !isUniSwapChecked &&
        (ethAmountBN.isZero() ||
          raiAmountBN.isZero() ||
          (ethAmountBN.isZero() && raiAmountBN.isZero))
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
      if (raiAmountBN.gt(raiBalanceBN)) {
        setError(`Deposited ${COIN_TICKER} cannot exceed available amount.`);
        return;
      }
    }

    if (type === 'withdraw') {
      const uniPoolBN = uniPool
        ? BigNumber.from(toFixedString(uniPool, 'WAD'))
        : BigNumber.from('0');
      const stakedBalanceBN = stakedBalance
        ? BigNumber.from(toFixedString(stakedBalance, 'WAD'))
        : BigNumber.from('0');

      if (uniPoolBN.isZero()) {
        setError(`Cannot withdraw nothing`);
        return;
      }

      if (uniPoolBN.gt(stakedBalanceBN)) {
        setError(`Cannot exceed max amount staked`);
        return;
      }
    }

    return true;
  };

  const handleCancel = () => {
    incentivesActions.setUniPoolAmount('');
    popupsActions.setIsIncentivesModalOpen(false);
    incentivesActions.setOperation(0);
  };

  const passedCheckForCoinAllowance = () => {
    const coinAllowance = connectWalletState.coinAllowance;
    const raiAmountBN = raiAmount
      ? BigNumber.from(toFixedString(raiAmount, 'WAD'))
      : BigNumber.from('0');

    const uniShareBN = uniShare
      ? BigNumber.from(toFixedString(uniShare, 'WAD'))
      : BigNumber.from('0');

    if (isChecked) {
      const uniCoinLpAllowanceBN = uniCoinLpAllowance
        ? BigNumber.from(toFixedString(uniCoinLpAllowance, 'WAD'))
        : BigNumber.from('0');
      incentivesActions.setAllowanceType('uniCoin');
      return uniCoinLpAllowanceBN.gte(uniShareBN);
    } else if (coinAllowance) {
      const coinAllowanceBN = BigNumber.from(
        toFixedString(coinAllowance, 'WAD')
      );
      incentivesActions.setAllowanceType('rai');
      return coinAllowanceBN.gte(raiAmountBN);
    }

    return false;
  };

  const handleSubmit = () => {
    const isPassedValidation = validationChecker();
    if (isPassedValidation) {
      incentivesActions.setSelectedCampaignAddress(campaignAddress);
      if (type === 'deposit' && !passedCheckForCoinAllowance()) {
        incentivesActions.setOperation(2);
      } else {
        incentivesActions.setOperation(3);
      }
    }
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

    let raiValue: string;

    if (isEth) {
      raiValue = coinAddress === token0 ? token0Price : token1Price;
    } else {
      raiValue = coinAddress === token0 ? token1Price : token0Price;
    }

    const valueBN = BigNumber.from(toFixedString(val, 'WAD'));
    const raiValueBN = BigNumber.from(toFixedString(raiValue, 'RAD')).div(
      gebUtils.RAY
    );

    const reflectValue = gebUtils
      .wadToFixed(valueBN.mul(raiValueBN).div(gebUtils.WAD))
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

  const handleUniPoolChange = (val: string) => {
    setUniPool(val);
    incentivesActions.setUniPoolAmount(val);
  };

  const handleUniswapCheck = (state: boolean) => {
    setIsUniSwapChecked(state);
    incentivesActions.setIsUniSwapShareChecked(state);
  };

  const handleUniShareChange = (val: string) => {
    setUniShare(val);
    incentivesActions.setUniswapShare(val);
  };

  useEffect(() => {
    setEthAmount(incentivesFields.ethAmount);
    setRaiAmount(incentivesFields.raiAmount);
  }, [incentivesFields]);

  useEffect(() => {
    setUniPool(uniPoolAmount);
  }, [uniPoolAmount]);

  useEffect(() => {
    setUniShare(uniswapShare);
  }, [uniswapShare]);

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
            label={`UNI Pool Tokens (Avail ${formatNumber(stakedBalance)})`}
            value={uniPool}
            onChange={handleUniPoolChange}
            handleMaxClick={() => handleUniPoolChange(stakedBalance)}
          />
        </SingleInput>
      ) : isChecked ? (
        <DecimalInput
          label={`Deposit Uniswap V2 ETH/${COIN_TICKER} LP shares (Avail ${
            assets?.uni.amount
              ? formatNumber(assets?.uni.amount.toString())
              : '0'
          })`}
          value={uniShare}
          onChange={handleUniShareChange}
          handleMaxClick={() =>
            handleUniShareChange(
              assets?.uni.amount ? assets?.uni.amount.toString() : ''
            )
          }
        />
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
            } ${COIN_TICKER} (Avail ${formatNumber(raiBalance.toString())})`}
            value={raiAmount}
            onChange={(val: string) => handleChange(val, false)}
            disableMax
          />
        </DoubleInput>
      )}

      {error && <Error>{error}</Error>}
      <Results />

      <UniSwapCheckContainer>
        <Text>
          {t(
            type === 'deposit'
              ? 'uniswap_deposit_check_text'
              : 'uniswap_withdraw_check_text'
          )}
        </Text>
        <CheckBox checked={isUniSwapChecked} onChange={handleUniswapCheck} />
      </UniSwapCheckContainer>
      <Footer>
        <Button dimmed text={t('cancel')} onClick={handleCancel} />
        <Button
          withArrow
          onClick={handleSubmit}
          text={t('review_transaction')}
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

const SingleInput = styled.div`
  margin: 20px 0;
`;

const Error = styled.p`
  color: ${(props) => props.theme.colors.dangerColor};
  font-size: ${(props) => props.theme.font.extraSmall};
  width: 100%;
  margin: 16px 0;
`;

const UniSwapCheckContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const Text = styled.div`
  line-height: 18px;
  letter-spacing: -0.18px;
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.extraSmall};
`;
