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
  getAvailableRaiToBorrow,
  getCollateralRatio,
  getLiquidationPrice,
  getRatePercentage,
  safeIsSafe,
} from '../../utils/helper';
import { NETWORK_ID } from '../../connectors';
import { DEFAULT_SAFE_STATE } from '../../utils/constants';

interface Props {
  isChecked?: boolean;
  isCreate?: boolean;
}

const CreateSafeBody = ({ isChecked, isCreate = true }: Props) => {
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
  } = useStoreState((state) => state);
  const { createSafeDefault, uniSwapPool } = safeState;

  const availableEth = formatNumber(
    connectWalletState.ethBalance[NETWORK_ID].toString()
  );

  const {
    currentPrice,
    liquidationCRatio,
    accumulatedRate,
    liquidationPenalty,
    debtFloor,
    safetyCRatio,
    currentRedemptionPrice,
  } = safeState.liquidationData;

  const availableRai = getAvailableRaiToBorrow(
    defaultSafe.leftInput,
    currentPrice.safetyPrice,
    accumulatedRate
  );
  const collateralRatio = getCollateralRatio(
    defaultSafe.leftInput,
    defaultSafe.rightInput,
    currentPrice.liquidationPrice,
    liquidationCRatio,
    accumulatedRate
  );

  const liquidationPenaltyPercentage = getRatePercentage(liquidationPenalty);
  const liquidationPrice = getLiquidationPrice(
    defaultSafe.leftInput,
    defaultSafe.rightInput,
    liquidationCRatio,
    accumulatedRate,
    currentRedemptionPrice
  );

  // const setMaxRai = () => {
  //   setDefaultSafe({ ...defaultSafe, borrowedRAI: availableRai.toString() });
  // }

  const isPassedCreateValidation = () => {
    if (!defaultSafe.leftInput) {
      setError('Please enter the amount of ETH to be deposited.');
      return false;
    } else if (Number(defaultSafe.leftInput) > availableEth) {
      setError('Insufficient balance.');
      return false;
    } else if (
      !defaultSafe.rightInput ||
      Number(defaultSafe.rightInput) < Number(debtFloor)
    ) {
      setError(
        `Minimum amount of RAI to be borrowed must be at least ${debtFloor}.`
      );
      return false;
    } else if (Number(defaultSafe.rightInput) > availableRai) {
      setError('RAI borrowed cannot exceed available amount.');
      return false;
    } else {
      const isSafe = safeIsSafe(
        defaultSafe.rightInput,
        defaultSafe.leftInput,
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
    return true;
  };

  const submitDefaultValues = () => {
    let passedValidation = false;
    if (isCreate) {
      passedValidation = isPassedCreateValidation();
    }

    if (passedValidation) {
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
      popupsActions.setIsCreateAccountModalOpen(false);
      safeActions.setUniSwapPool(DEFAULT_SAFE_STATE);
      safeActions.setCreateSafeDefault(DEFAULT_SAFE_STATE);
      setUniSwapVal(DEFAULT_SAFE_STATE);
      setDefaultSafe(DEFAULT_SAFE_STATE);
    }
  };

  const onChangeBorrow = (val: string) => {
    setDefaultSafe({ ...defaultSafe, rightInput: val });
    if (error) {
      setError('');
    }
  };

  const onChangeDeposit = (val: string) => {
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
        <DoubleInput>
          <DecimalInput
            label={`Deposit ETH (Avail ${availableEth})`}
            value={defaultSafe.leftInput}
            onChange={onChangeDeposit}
            disableMax
            disabled={isChecked}
          />
          <DecimalInput
            label={`Borrow RAI (Avail ${availableRai})`}
            value={defaultSafe.rightInput}
            onChange={onChangeBorrow}
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
              onChange={onChangeDeposit}
            />
            <DecimalInput
              label={`RAI on Uniswap (Avail ${availableRai})`}
              value={uniSwapVal ? uniSwapVal.rightInput : ''}
              onChange={onChangeBorrow}
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

export default CreateSafeBody;

const DoubleInput = styled.div`
  display: flex;
  margin-bottom: 16px;

  > div {
    &:last-child {
      flex: 0 0 calc(57% + 10px);
      margin-left: -10px;
    }
    &:first-child {
      flex: 0 0 44%;
      input {
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
