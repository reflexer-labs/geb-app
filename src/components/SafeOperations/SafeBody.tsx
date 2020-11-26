import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'ethers';
import { utils as gebUtils } from 'geb.js';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../../store';
import { ISafeData } from '../../utils/interfaces';
import Button from '../Button';
// import CheckBox from '../CheckBox';
import DecimalInput from '../DecimalInput';
import {
  formatNumber,
  getCollateralRatio,
  getLiquidationPrice,
  getRatePercentage,
  returnAvaiableDebt,
  returnPercentAmount,
  returnTotalDebt,
  returnTotalValue,
  safeIsSafe,
  toFixedString,
} from '../../utils/helper';
import { NETWORK_ID } from '../../connectors';
import { DEFAULT_SAFE_STATE, TICKER_NAME } from '../../utils/constants';

interface Props {
  isChecked?: boolean;
}

const SafeBody = ({ isChecked }: Props) => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [checkUniSwapPool, setCheckUniSwapPool] = useState(isChecked || false);
  const [error, setError] = useState('');
  const [defaultSafe, setDefaultSafe] = useState<ISafeData>(DEFAULT_SAFE_STATE);
  const [uniSwapVal, setUniSwapVal] = useState<ISafeData>(DEFAULT_SAFE_STATE);

  const {
    safeModel: safeActions,
    popupsModel: popupsActions,
  } = useStoreActions((state) => state);
  const {
    connectWalletModel: connectWalletState,
    safeModel: safeState,
    popupsModel: popupsState,
  } = useStoreState((state) => state);
  const { safeData, uniSwapPool, singleSafe } = safeState;
  const { type, isCreate } = popupsState.safeOperationPayload;
  const {
    currentPrice,
    liquidationCRatio,
    accumulatedRate,
    liquidationPenalty,
    debtFloor,
    safetyCRatio,
    currentRedemptionPrice,
    debtCeiling,
    globalDebt,
    perSafeDebtCeiling,
  } = safeState.liquidationData;

  const praiBalance = connectWalletState.praiBalance[NETWORK_ID];

  const getTotalCollateral = () => {
    if (singleSafe) {
      if (type === 'repay_withdraw') {
        return returnTotalValue(
          singleSafe.collateral,
          defaultSafe.leftInput,
          true,
          true
        ).toString();
      }
      return returnTotalValue(
        singleSafe.collateral,
        defaultSafe.leftInput
      ).toString();
    }
    return defaultSafe.leftInput;
  };

  const getTotalDebt = () => {
    if (singleSafe) {
      if (type === 'repay_withdraw') {
        return returnTotalValue(
          returnTotalDebt(singleSafe.debt, accumulatedRate) as string,
          defaultSafe.rightInput,
          true,
          true
        ).toString();
      }
      return returnTotalValue(
        singleSafe.debt,
        defaultSafe.rightInput
      ).toString();
    }
    return defaultSafe.rightInput;
  };

  const totalCollateral = getTotalCollateral() || '0';
  const totalDebt = getTotalDebt() || '0';

  const getAvailableEth = () => {
    if (type === 'deposit_borrow') {
      return formatNumber(connectWalletState.ethBalance[NETWORK_ID].toString());
    } else {
      if (singleSafe) {
        return singleSafe.collateral;
      }
    }
    return '';
  };

  const getAvailableRai = () => {
    if (type === 'deposit_borrow' && isCreate) {
      return returnAvaiableDebt(
        currentPrice.safetyPrice,
        defaultSafe.leftInput
      );
    } else if (type === 'deposit_borrow' && !isCreate) {
      if (singleSafe) {
        return returnAvaiableDebt(
          currentPrice.safetyPrice,
          defaultSafe.leftInput,
          singleSafe.collateral,
          singleSafe.debt
        );
      }
    } else {
      if (singleSafe) {
        return returnTotalDebt(singleSafe.debt, accumulatedRate) as string;
      }
    }
    return '';
  };
  const returnInputType = (isLeft = true) => {
    if (type === 'deposit_borrow' && isLeft) {
      return `Deposit ETH (Avail ${getAvailableEth()})`;
    }
    if (type === 'deposit_borrow' && !isLeft) {
      return `Borrow ${TICKER_NAME} (Avail ${getAvailableRai()})`;
    }
    if (type === 'repay_withdraw' && isLeft) {
      return `Withdraw ETH (Avail ${getAvailableEth()})`;
    }
    if (type === 'repay_withdraw' && singleSafe && !isLeft) {
      return `Repay ${TICKER_NAME} (Owe: ${formatNumber(
        getAvailableRai()
      )}, Avail: ${formatNumber(praiBalance.toString())})`;
    }
    return '';
  };

  const collateralRatio = getCollateralRatio(
    totalCollateral,
    totalDebt,
    currentPrice.liquidationPrice,
    liquidationCRatio,
    accumulatedRate
  );

  const liquidationPenaltyPercentage = getRatePercentage(liquidationPenalty);
  const liquidationPrice = getLiquidationPrice(
    totalCollateral,
    totalDebt,
    liquidationCRatio,
    accumulatedRate,
    currentRedemptionPrice
  );

  const isPassedValidation = () => {
    const availableEthBN = BigNumber.from(
      toFixedString(getAvailableEth().toString(), 'WAD')
    );
    const availableRaiBN = BigNumber.from(
      toFixedString(getAvailableRai().toString(), 'WAD')
    );

    const praiBalanceBN = BigNumber.from(
      toFixedString(praiBalance.toString(), 'WAD')
    );

    const leftInputBN = defaultSafe.leftInput
      ? BigNumber.from(toFixedString(defaultSafe.leftInput, 'WAD'))
      : BigNumber.from('0');

    const rightInputBN = defaultSafe.rightInput
      ? BigNumber.from(toFixedString(defaultSafe.rightInput, 'WAD'))
      : BigNumber.from('0');

    const debtFloorBN = BigNumber.from(toFixedString(debtFloor, 'WAD'));
    const totalDebtBN = BigNumber.from(toFixedString(totalDebt, 'WAD'));

    const accumlatedRateBN = BigNumber.from(
      toFixedString(accumulatedRate, 'RAY')
    );

    const globalDebtBN = BigNumber.from(toFixedString(globalDebt, 'RAD'));
    const debtCeilingBN = BigNumber.from(toFixedString(debtCeiling, 'RAD'));

    if (type === 'deposit_borrow') {
      if (leftInputBN.gt(availableEthBN)) {
        setError('Insufficient balance.');
        return false;
      } else if (rightInputBN.gt(availableRaiBN)) {
        setError(`${TICKER_NAME} borrowed cannot exceed available amount.`);
        return false;
      } else if (isCreate) {
        if (leftInputBN.isZero()) {
          setError('Please enter the amount of ETH to be deposited.');
          return false;
        }
      } else {
        if (leftInputBN.isZero() && rightInputBN.isZero()) {
          setError(
            `Please enter the amount of ETH to be deposited or amount of ${TICKER_NAME} to be borrowed`
          );
          return false;
        }
      }
    }
    if (type === 'repay_withdraw') {
      if (leftInputBN.isZero() && rightInputBN.isZero()) {
        setError(
          `Please enter the amount of ETH to free or the amount of ${TICKER_NAME} to be repay`
        );
        return false;
      } else if (leftInputBN.gt(availableEthBN)) {
        setError('ETH to unlock cannot exceed available amount.');
        return false;
      }
      if (rightInputBN.gt(availableRaiBN)) {
        setError(`${TICKER_NAME} to repay cannot exceed owed amount.`);
        return false;
      }

      if (!rightInputBN.isZero()) {
        const repayPercent = returnPercentAmount(
          defaultSafe.rightInput,
          getAvailableRai() as string
        );

        if (
          rightInputBN.lt(BigNumber.from(availableRaiBN)) &&
          repayPercent > 95
        ) {
          setError(
            `You can only repay a minimum of ${getAvailableRai()} ${TICKER_NAME} to avoid leaving residual values`
          );
          return false;
        }
      }

      if (!rightInputBN.isZero() && rightInputBN.gt(praiBalanceBN)) {
        setError(`ballance_issue`);
        return false;
      }

      if (!isCreate) {
        const perSafeDebtCeilingBN = BigNumber.from(
          toFixedString(perSafeDebtCeiling, 'WAD')
        );
        if (totalDebtBN.gte(perSafeDebtCeilingBN)) {
          setError(
            `Individual safe can't have more than ${perSafeDebtCeiling} ${TICKER_NAME} of debt.`
          );
          return;
        }
      }
    }

    if (
      defaultSafe.rightInput &&
      !rightInputBN.isZero() &&
      !totalDebtBN.isZero() &&
      totalDebtBN.mul(accumlatedRateBN).lt(debtFloorBN.mul(gebUtils.RAY))
    ) {
      setError(
        `The resulting debt should be at least ${debtFloor} ${TICKER_NAME} or zero.`
      );
      return false;
    }

    const isSafe = safeIsSafe(
      totalCollateral,
      totalDebt,
      currentPrice.safetyPrice,
      accumulatedRate
    );

    if (!isSafe && (collateralRatio as number) >= 0) {
      setError(`Too much debt, below ${safetyCRatio} collateralization ratio`);
      return false;
    }

    if (globalDebtBN.add(totalDebtBN).gt(debtCeilingBN)) {
      setError(
        `Debt ceiling too low, not possible to draw this amount of ${TICKER_NAME}.`
      );
      return;
    }

    return true;
  };

  const passedCheckForCoinAllowance = () => {
    const coinAllowance = connectWalletState.coinAllowance;
    const rightInputBN = defaultSafe.rightInput
      ? BigNumber.from(toFixedString(defaultSafe.rightInput, 'WAD'))
      : BigNumber.from('0');
    if (coinAllowance) {
      const coinAllowanceBN = BigNumber.from(
        toFixedString(coinAllowance, 'WAD')
      );
      return coinAllowanceBN.gte(rightInputBN);
    }
    return false;
  };

  const returnMaxRepayValue = () => {
    const availableRaiBN = BigNumber.from(
      toFixedString(getAvailableRai().toString(), 'WAD')
    );
    const praiBalanceBN = BigNumber.from(
      toFixedString(praiBalance.toString(), 'WAD')
    );
    const diff = gebUtils
      .wadToFixed(availableRaiBN.sub(praiBalanceBN))
      .toString();

    return `Insufficient balance. You are ${diff} short`;
  };

  const submitDefaultValues = () => {
    const passedValidation = isPassedValidation();
    if (passedValidation) {
      if (!defaultSafe.leftInput) {
        defaultSafe.leftInput = '0';
      }
      if (!defaultSafe.rightInput) {
        defaultSafe.rightInput = '0';
      }

      safeActions.setSafeData({
        ...defaultSafe,
        totalCollateral,
        totalDebt,
        collateralRatio: collateralRatio as number,
        liquidationPrice: liquidationPrice as number,
      });

      safeActions.setIsUniSwapPoolChecked(checkUniSwapPool);
      const isPassed = passedCheckForCoinAllowance();

      if (checkUniSwapPool) {
        safeActions.setStage(1);
      } else if (
        type === 'repay_withdraw' &&
        Number(defaultSafe.rightInput) > 0 &&
        !isPassed
      ) {
        safeActions.setStage(2);
      } else {
        safeActions.setStage(3);
      }
    }
  };

  const submitUniSwapPool = () => {
    safeActions.setUniSwapPool({
      ...uniSwapVal,
      collateralRatio: collateralRatio as number,
    });
    safeActions.setStage(3);
  };

  const handleCancel = () => {
    if (isChecked) {
      safeActions.setStage(0);
    } else {
      safeActions.setIsUniSwapPoolChecked(false);
      safeActions.setStage(0);
      popupsActions.setSafeOperationPayload({
        isOpen: false,
        type: '',
        isCreate: false,
      });
      safeActions.setUniSwapPool(DEFAULT_SAFE_STATE);
      safeActions.setSafeData(DEFAULT_SAFE_STATE);
      setUniSwapVal(DEFAULT_SAFE_STATE);
      setDefaultSafe(DEFAULT_SAFE_STATE);
    }
  };

  const onChangeRight = (val: string) => {
    setDefaultSafe({
      ...defaultSafe,
      totalCollateral,
      totalDebt,
      rightInput: val,
    });
    if (error) {
      setError('');
    }
  };

  const onChangeLeft = (val: string) => {
    setDefaultSafe({
      ...defaultSafe,
      totalCollateral,
      totalDebt,
      leftInput: val,
    });
    if (error) {
      setError('');
    }
  };

  useEffect(() => {
    setDefaultSafe(safeData);
    setUniSwapVal(uniSwapPool);
  }, [safeData, uniSwapPool]);

  return (
    <>
      <Body>
        <DoubleInput className={type === 'repay_withdraw' ? 'reverse' : ''}>
          <DecimalInput
            label={returnInputType()}
            value={defaultSafe.leftInput}
            onChange={onChangeLeft}
            disabled={isChecked}
            disableMax={type !== 'repay_withdraw'}
            handleMaxClick={() => onChangeLeft(getAvailableEth().toString())}
          />
          <DecimalInput
            label={returnInputType(false)}
            value={defaultSafe.rightInput}
            onChange={onChangeRight}
            disabled={isChecked}
            disableMax={type !== 'repay_withdraw'}
            handleMaxClick={() => onChangeRight(getAvailableRai().toString())}
          />
        </DoubleInput>

        {error && (
          <Error>
            {error === 'ballance_issue' ? returnMaxRepayValue() : error}
          </Error>
        )}

        {isChecked ? (
          <DoubleInput>
            <DecimalInput
              label={'ETH on Uniswap (Avail 0.00)'}
              value={uniSwapVal ? uniSwapVal.leftInput : ''}
              onChange={() => {}}
            />
            <DecimalInput
              label={`${TICKER_NAME} on Uniswap (Avail ${getAvailableRai()})`}
              value={uniSwapVal ? uniSwapVal.rightInput : ''}
              onChange={() => {}}
              disableMax
              // handleMaxClick={setMaxRai}
            />
          </DoubleInput>
        ) : null}

        <Result>
          <Block>
            <Item>
              <Label>{'Total ETH Collateral'}</Label>{' '}
              <Value>{`${totalCollateral ? totalCollateral : 0}`}</Value>
            </Item>
            <Item>
              <Label>{`Total ${TICKER_NAME} Debt`}</Label>{' '}
              <Value>{`${totalDebt ? totalDebt : 0}`}</Value>
            </Item>
            <Item>
              <Label>{`ETH Price`}</Label>{' '}
              <Value>{`$${formatNumber(currentPrice.value, 2)}`}</Value>
            </Item>
            <Item>
              <Label>{`${TICKER_NAME} Price`}</Label>{' '}
              <Value>{`$${formatNumber(currentRedemptionPrice, 3)}`}</Value>
            </Item>

            <Item>
              <Label>
                {!isCreate ? 'New Collateral Ratio' : 'Collateral Ratio'}
              </Label>{' '}
              <Value>{`${collateralRatio > 0 ? collateralRatio : '∞'}%`}</Value>
            </Item>
            <Item>
              <Label>
                {!isCreate ? 'New Liquidation Price' : 'Liquidation Price'}
              </Label>{' '}
              <Value>{`$${liquidationPrice > 0 ? liquidationPrice : 0}`}</Value>
            </Item>
            <Item>
              <Label>{'Liquidation Penalty'}</Label>{' '}
              <Value>{`${liquidationPenaltyPercentage}%`}</Value>
            </Item>
          </Block>
        </Result>

        {/*{isChecked ? null : (
          <UniSwapCheckContainer>
            <Text>{t('uniswap_modal_check_text',{ticker_name: TICKER_NAME})}</Text>
            <CheckBox
              checked={checkUniSwapPool}
              onChange={(state: boolean) => {
                setCheckUniSwapPool(state);
                walletActions.setIsUniSwapPoolChecked(state);
              }}
            />
          </UniSwapCheckContainer>
        )}*/}
      </Body>

      <Footer>
        <Button
          dimmed={!isChecked}
          text={t(isChecked ? 'back' : 'cancel')}
          onClick={handleCancel}
          dimmedWithArrow={isChecked}
        />
        <Button
          withArrow
          onClick={isChecked ? submitUniSwapPool : submitDefaultValues}
          text={t(
            checkUniSwapPool && !isChecked
              ? 'uniswap_pool'
              : 'review_transaction'
          )}
        />
      </Footer>
    </>
  );
};

export default SafeBody;

const DoubleInput = styled.div`
  display: flex;
  margin-bottom: 16px;

  > div {
    &:last-child {
      flex: 0 0 calc(50% + 5px);
      margin-left: -5px;
    }
    &:first-child {
      flex: 0 0 50%;
    }
  }

  &.reverse {
    > div {
      &:first-child {
        order: 2;
        flex: 0 0 calc(50% + 5px);
        margin-left: -5px;
      }
      &:last-child {
        flex: 0 0 50%;
        margin-left: 0;
      }
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

    &.reverse {
      > div {
      flex: 0 0 100%;
      max-width: 100%;
      &:last-child {
        margin-left: 0;
        margin-top: 0px;
      }
      &:first-child {
        margin-left: 0;
        margin-top: 20px;
      }
    }
    }
    
  `}
`;

const Result = styled.div`
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

// const UniSwapCheckContainer = styled.div`
//   display: flex;
//   justify-content: space-between;
//   margin-top: 20px;
// `;

// const Text = styled.div`
//   line-height: 18px;
//   letter-spacing: -0.18px;
//   color: ${(props) => props.theme.colors.secondary};
//   font-size: ${(props) => props.theme.font.extraSmall};
// `;

const Body = styled.div`
  padding: 20px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px;
`;

const Error = styled.p`
  color: ${(props) => props.theme.colors.dangerColor};
  font-size: ${(props) => props.theme.font.extraSmall};
  width: 100%;
  margin: 16px 0;
`;

// const InlineBtn = styled.button`
//   background: none;
//   box-shadow: none;
//   border: 0;
//   cursor: pointer;
//   outline: none;
//   &:hover {
//     text-decoration: undeline;
//     color: ${(props) => props.theme.colors.inputBorderColor};
//   }
// `;
