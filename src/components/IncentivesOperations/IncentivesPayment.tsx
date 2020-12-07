import React, { useState } from 'react';
import { BigNumber } from 'ethers';
import { utils as gebUtils } from 'geb.js';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../../store';
import { COIN_TICKER } from '../../utils/constants';
import _ from '../../utils/lodash';
import Button from '../Button';
import CheckBox from '../CheckBox';
import DecimalInput from '../DecimalInput';
import Dropdown from '../Dropdown';
import { formatNumber, toFixedString } from '../../utils/helper';
import { NETWORK_ID } from '../../connectors';

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

  const { incentivesCampaignData, type } = incentivesState;

  const ethBalance = connectWalletState.ethBalance[NETWORK_ID];
  const praiBalance = connectWalletState.praiBalance[NETWORK_ID];

  const coinAddress = _.get(
    incentivesCampaignData,
    'systemState.coinAddress',
    ''
  );
  const token0 = _.get(
    incentivesCampaignData,
    'systemState.coinUniswapPair.token0',
    ''
  );
  const token0Price = _.get(
    incentivesCampaignData,
    'systemState.coinUniswapPair.token0Price',
    '0'
  );
  const token1Price = _.get(
    incentivesCampaignData,
    'systemState.coinUniswapPair.token1Price',
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

  const handleSubmit = () => {
    const isPassedValidation = validationChecker();
    if (isPassedValidation) {
      if (leaveLiquidity) {
        incentivesActions.setOperation(1);
      } else {
        incentivesActions.setOperation(2);
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
      return;
    }
    if (!coinAddress || !token0) return;

    let priveValue: string;

    if (isEth) {
      priveValue = coinAddress === token0 ? token0Price : token1Price;
    } else {
      priveValue = coinAddress === token0 ? token1Price : token0Price;
    }

    const valueBN = BigNumber.from(toFixedString(val, 'WAD'));
    const priveValueBN = BigNumber.from(toFixedString(priveValue, 'RAD')).div(
      gebUtils.RAY
    );

    const reflectValue = formatNumber(
      gebUtils
        .wadToFixed(valueBN.mul(priveValueBN).div(gebUtils.WAD))
        .toString()
    ) as string;

    setRaiAmount(isEth ? reflectValue : val);
    setEthAmount(isEth ? val : reflectValue);
  };

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
      <Result>
        <Block>
          <Item>
            <Label>
              {incentivesState.type === 'withdraw'
                ? `${COIN_TICKER} Withdrawn`
                : `${COIN_TICKER} per ETH`}
            </Label>{' '}
            <Value>{'0.12345678'}</Value>
          </Item>
          <Item>
            <Label>
              {incentivesState.type === 'withdraw'
                ? 'ETH Withdrawn'
                : `ETH per ${COIN_TICKER}`}
            </Label>{' '}
            <Value>{'432.1098'}</Value>
          </Item>
          <Item>
            <Label>{'Share of Uniswap Pool'}</Label> <Value>{'0.00'}</Value>
          </Item>
          <Item>
            <Label>{'Share of Incentives Pool'}</Label> <Value>{'0.00'}</Value>
          </Item>
          {incentivesState.type === 'withdraw' ? (
            <>
              <Item>
                <Label>{'Rewards Received Now'}</Label> <Value>{'0.00'}</Value>
              </Item>
              <Item>
                <Label>{'Rewards to Unlock'}</Label> <Value>{'0.00'}</Value>
              </Item>
              <Item>
                <Label>{'Unlock Time'}</Label> <Value>{'0.00'}</Value>
              </Item>
            </>
          ) : (
            <>
              <Item>
                <Label>{'Campaign #'}</Label> <Value>{'1234'}</Value>
              </Item>
              <Item>
                <Label>{'FLX per Block'}</Label> <Value>{'12.00'}</Value>
              </Item>
            </>
          )}
        </Block>
      </Result>

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

const Result = styled.div`
  margin-top: 20px;
  border-radius: ${(props) => props.theme.global.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.foreground};
`;

const Block = styled.div`
  border-bottom: 1px solid;
  padding: 16px 20px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  &:last-child {
    border-bottom: 0;
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.secondary};
  letter-spacing: -0.09px;
  line-height: 21px;
`;

const Value = styled.div`
  font-size: ${(props) => props.theme.font.small};
  color: ${(props) => props.theme.colors.primary};
  letter-spacing: -0.09px;
  line-height: 21px;
  font-weight: 600;
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