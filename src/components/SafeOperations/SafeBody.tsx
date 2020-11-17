import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStoreActions, useStoreState } from '../../store';
import { CreateSafeType } from '../../utils/interfaces';
import Button from '../Button';
// import CheckBox from '../CheckBox';
import DecimalInput from '../DecimalInput';
import {
  formatNumber,
  getCollateralRatio,
  getLiquidationPrice,
  getRatePercentage,
  returnAvaiableDebt,
  returnTotalValue,
  safeIsSafe,
  toFixedString,
} from '../../utils/helper';
import { NETWORK_ID } from '../../connectors';
import { DEFAULT_SAFE_STATE } from '../../utils/constants';
import { BigNumber } from 'ethers';

interface Props {
  isChecked?: boolean;
}

const SafeBody = ({ isChecked }: Props) => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [checkUniSwapPool, setCheckUniSwapPool] = useState(isChecked || false);
  const [error, setError] = useState('');
  const [defaultSafe, setDefaultSafe] = useState<CreateSafeType>(
    DEFAULT_SAFE_STATE
  );
  const [uniSwapVal, setUniSwapVal] = useState<CreateSafeType>(
    DEFAULT_SAFE_STATE
  );

  const {
    safeModel: safeActions,
    popupsModel: popupsActions,
  } = useStoreActions((state) => state);
  const {
    connectWalletModel: connectWalletState,
    safeModel: safeState,
    popupsModel: popupsState,
  } = useStoreState((state) => state);
  const { createSafeDefault, uniSwapPool, singleSafe } = safeState;
  const { type, isCreate } = popupsState.safeOperationPayload;
  const {
    currentPrice,
    liquidationCRatio,
    accumulatedRate,
    liquidationPenalty,
    debtFloor,
    safetyCRatio,
    currentRedemptionPrice,
  } = safeState.liquidationData;

  const totalCollateral = singleSafe
    ? returnTotalValue(singleSafe.collateral, defaultSafe.leftInput).toString()
    : defaultSafe.leftInput;

  const totalDebt = singleSafe
    ? returnTotalValue(singleSafe.debt, defaultSafe.rightInput).toString()
    : defaultSafe.rightInput;

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
        return formatNumber(singleSafe.debt, 4);
      }
    }
    return '';
  };
  const returnInputType = (isLeft = true) => {
    if (type === 'deposit_borrow' && isLeft) {
      return `Deposit ETH (Avail ${getAvailableEth()})`;
    }
    if (type === 'deposit_borrow' && !isLeft) {
      return `Borrow RAI (Avail ${getAvailableRai()})`;
    }
    if (type === 'repay_withdraw' && isLeft) {
      return `Withdraw ETH (Avail ${getAvailableEth()})`;
    }
    if (type === 'repay_withdraw' && !isLeft) {
      return `Repay RAI (Avail ${getAvailableRai()})`;
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

  // const setMaxRai = () => {
  //   setDefaultSafe({ ...defaultSafe, borrowedRAI: availableRai.toString() });
  // }

  const passedDepositBorrowValidation = () => {
    const availableEthBN = BigNumber.from(
      toFixedString(getAvailableEth().toString(), 'WAD')
    );
    const availableRaiBN = BigNumber.from(
      toFixedString(getAvailableRai().toString(), 'WAD')
    );

    const leftInputBN = defaultSafe.leftInput
      ? BigNumber.from(toFixedString(defaultSafe.leftInput, 'WAD'))
      : BigNumber.from('0');

    const rightInputBN = defaultSafe.rightInput
      ? BigNumber.from(toFixedString(defaultSafe.rightInput, 'WAD'))
      : BigNumber.from('0');

    const debtFloorBN = BigNumber.from(toFixedString(debtFloor, 'WAD'));

    if (type === 'deposit_borrow') {
      if (leftInputBN.gt(availableEthBN)) {
        setError('Insufficient balance.');
        return false;
      } else if (rightInputBN.gt(availableRaiBN)) {
        setError('RAI borrowed cannot exceed available amount.');
        return false;
      } else if (
        defaultSafe.rightInput &&
        !rightInputBN.isZero() &&
        rightInputBN.lt(BigNumber.from(debtFloorBN))
      ) {
        setError(
          `The resulting debt should be at least ${debtFloor} RAI or zero.`
        );
        return false;
      }
      if (isCreate) {
        if (leftInputBN.isZero()) {
          setError('Please enter the amount of ETH to be deposited.');
          return false;
        }
        if (rightInputBN.isZero()) {
          setError('Please enter the amount of RAI to be borrowed.');
          return false;
        }
      } else {
        if (leftInputBN.isZero() && rightInputBN.isZero()) {
          setError(
            'Please enter the amount of ETH to be deposited or amount of RAI to be borrowed'
          );
          return false;
        }
      }

      const isSafe = safeIsSafe(
        totalCollateral,
        totalDebt,
        currentPrice.safetyPrice,
        accumulatedRate
      );

      if (!isSafe) {
        setError(
          `Too much debt, below ${safetyCRatio} collateralization ratio`
        );
        return false;
      }
    }

    if (type === 'repay_withdraw') {
      if (leftInputBN.isZero() && rightInputBN.isZero()) {
        setError(
          'Please enter the amount of ETH to free or amount of RAI to be repay'
        );
        return false;
      } else if (leftInputBN.gt(availableEthBN)) {
        setError('ETH to unlock cannot exceed available amount.');
        return false;
      }
    }

    return true;
  };

  const submitDefaultValues = () => {
    const passedValidation = passedDepositBorrowValidation();

    if (passedValidation) {
      if (!defaultSafe.leftInput) {
        defaultSafe.leftInput = '0';
      }
      if (!defaultSafe.rightInput) {
        defaultSafe.rightInput = '0';
      }
      safeActions.setCreateSafeDefault({
        ...defaultSafe,
        collateralRatio: collateralRatio as number,
        liquidationPrice: liquidationPrice as number,
      });

      safeActions.setIsUniSwapPoolChecked(checkUniSwapPool);

      if (checkUniSwapPool) {
        safeActions.setStage(1);
      } else {
        safeActions.setStage(2);
      }
    }
  };

  const submitUniSwapPool = () => {
    safeActions.setUniSwapPool({
      ...uniSwapVal,
      collateralRatio: collateralRatio as number,
    });
    safeActions.setStage(2);
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
      safeActions.setCreateSafeDefault(DEFAULT_SAFE_STATE);
      setUniSwapVal(DEFAULT_SAFE_STATE);
      setDefaultSafe(DEFAULT_SAFE_STATE);
    }
  };

  const onChangeRight = (val: string) => {
    setDefaultSafe({ ...defaultSafe, rightInput: val });
    if (error) {
      setError('');
    }
  };

  const onChangeLeft = (val: string) => {
    setDefaultSafe({ ...defaultSafe, leftInput: val });
    if (error) {
      setError('');
    }
  };

  useEffect(() => {
    safeActions.fetchLiquidationData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setDefaultSafe(createSafeDefault);
    setUniSwapVal(uniSwapPool);
  }, [createSafeDefault, uniSwapPool]);

  return (
    <>
      <Body>
        <DoubleInput className={type === 'repay_withdraw' ? 'reverse' : ''}>
          <DecimalInput
            label={returnInputType()}
            value={defaultSafe.leftInput}
            onChange={onChangeLeft}
            disableMax
            disabled={isChecked}
          />
          <DecimalInput
            label={returnInputType(false)}
            value={defaultSafe.rightInput}
            onChange={onChangeRight}
            disableMax
            // handleMaxClick={setMaxRai}
            disabled={isChecked}
          />
        </DoubleInput>

        {error && <Error>{error}</Error>}

        {isChecked ? (
          <DoubleInput>
            <DecimalInput
              label={'ETH on Uniswap (Avail 0.00)'}
              value={uniSwapVal ? uniSwapVal.leftInput : ''}
              onChange={() => {}}
            />
            <DecimalInput
              label={`RAI on Uniswap (Avail ${getAvailableRai()})`}
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
              <Label>{'Collateral Ratio'}</Label>{' '}
              <Value>{`${collateralRatio}%`}</Value>
            </Item>
            <Item>
              <Label>{'Liquidation Price'}</Label>{' '}
              <Value>{`$${liquidationPrice}`}</Value>
            </Item>
            <Item>
              <Label>{'Liquidation Penalty'}</Label>{' '}
              <Value>{`${liquidationPenaltyPercentage}%`}</Value>
            </Item>
          </Block>
        </Result>

        {/*{isChecked ? null : (
          <UniSwapCheckContainer>
            <Text>{t('uniswap_modal_check_text')}</Text>
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
      flex: 0 0 calc(57% + 5px);
      margin-left: -10px;
    }
    &:first-child {
      flex: 0 0 44%;
    }
  }

  &.reverse {
    > div {
      &:first-child {
        order: 2;
        flex: 0 0 calc(57% + 5px);
        margin-left: -10px;
      }
      &:last-child {
        flex: 0 0 44%;
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
