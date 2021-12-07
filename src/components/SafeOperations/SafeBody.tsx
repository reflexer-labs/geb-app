import React, { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { BigNumber } from 'ethers'
import { utils as gebUtils } from 'geb.js'
import styled from 'styled-components'
import { useStoreActions, useStoreState } from '../../store'
import { ISafeData } from '../../utils/interfaces'
import Button from '../Button'
import numeral from 'numeral'
// import CheckBox from '../CheckBox';
import DecimalInput from '../DecimalInput'
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
} from '../../utils/helper'
import { NETWORK_ID } from '../../connectors'
import { DEFAULT_SAFE_STATE, COIN_TICKER } from '../../utils/constants'
import { Info } from 'react-feather'
import ReactTooltip from 'react-tooltip'
import { useIsOwner, useProxyAddress } from '../../hooks/useGeb'
import { useMinSaviourBalance, useSaviourData } from '../../hooks/useSaviour'
import AlertLabel from '../AlertLabel'

export const LIQUIDATION_RATIO = 135 // percent
interface Props {
    isChecked?: boolean
}

const SafeBody = ({ isChecked }: Props) => {
    const { t } = useTranslation()
    const proxyAddress = useProxyAddress()
    const { getMinSaviourBalance } = useMinSaviourBalance()
    const saviourData = useSaviourData()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [checkUniSwapPool, setCheckUniSwapPool] = useState(isChecked || false)
    const [error, setError] = useState('')
    const [defaultSafe, setDefaultSafe] =
        useState<ISafeData>(DEFAULT_SAFE_STATE)
    const [uniSwapVal, setUniSwapVal] = useState<ISafeData>(DEFAULT_SAFE_STATE)

    const { safeModel: safeActions, popupsModel: popupsActions } =
        useStoreActions((state) => state)
    const {
        connectWalletModel: connectWalletState,
        safeModel: safeState,
        popupsModel: popupsState,
    } = useStoreState((state) => state)
    const { safeData, uniSwapPool, singleSafe } = safeState
    const { type, isCreate } = popupsState.safeOperationPayload
    const {
        currentPrice,
        liquidationCRatio,
        accumulatedRate,
        liquidationPenalty,
        debtFloor,
        safetyCRatio,
        currentRedemptionPrice,
        debtCeiling,
        perSafeDebtCeiling,
        globalDebtCeiling,
    } = safeState.liquidationData

    const raiPrice = singleSafe
        ? (formatNumber(currentRedemptionPrice, 3) as number)
        : 0

    const isOwner = useIsOwner(singleSafe?.id as string)
    const raiBalance = connectWalletState.raiBalance[NETWORK_ID].toString()

    const getTotalCollateral = () => {
        if (singleSafe) {
            if (type === 'repay_withdraw') {
                return returnTotalValue(
                    singleSafe.collateral,
                    defaultSafe.leftInput,
                    true,
                    true
                ).toString()
            }
            return returnTotalValue(
                singleSafe.collateral,
                defaultSafe.leftInput
            ).toString()
        }
        return defaultSafe.leftInput
    }

    const getTotalDebt = () => {
        if (singleSafe) {
            if (type === 'repay_withdraw') {
                return returnTotalValue(
                    returnTotalDebt(singleSafe.debt, accumulatedRate) as string,
                    defaultSafe.rightInput,
                    true,
                    true
                ).toString()
            }
            return returnTotalValue(
                returnTotalDebt(singleSafe.debt, accumulatedRate) as string,
                defaultSafe.rightInput
            ).toString()
        }
        return defaultSafe.rightInput
    }

    const totalCollateral = getTotalCollateral() || '0'

    const totalDebt = getTotalDebt() || '0'

    const getAvailableEth = () => {
        if (type === 'deposit_borrow') {
            return formatNumber(
                connectWalletState.ethBalance[NETWORK_ID].toString()
            )
        } else {
            if (singleSafe) {
                return singleSafe.collateral
            }
        }
        return '0'
    }

    const getAvailableRai = () => {
        if (type === 'deposit_borrow' && isCreate) {
            return returnAvaiableDebt(
                currentPrice.safetyPrice,
                accumulatedRate,
                defaultSafe.leftInput
            )
        } else if (type === 'deposit_borrow' && !isCreate) {
            if (singleSafe) {
                return returnAvaiableDebt(
                    currentPrice.safetyPrice,
                    accumulatedRate,
                    defaultSafe.leftInput,
                    singleSafe.collateral,
                    singleSafe.debt
                )
            }
        } else {
            if (singleSafe) {
                return returnTotalDebt(
                    singleSafe.debt,
                    accumulatedRate
                ) as string
            }
        }
        return '0'
    }

    const returnInputType = (isLeft = true) => {
        if (type === 'deposit_borrow' && isLeft) {
            return `Deposit ETH (Available: ${formatNumber(
                getAvailableEth() as string,
                2
            )})`
        }
        if (type === 'deposit_borrow' && !isLeft) {
            return `Borrow ${COIN_TICKER} (Max: ${
                Number(getAvailableRai()) > 0.01
                    ? formatNumber(getAvailableRai(), 2)
                    : '< 0.01'
            } ${
                isCreate
                    ? ''
                    : `≃ $${formatNumber(
                          String(Number(getAvailableRai()) * raiPrice),
                          2
                      )}`
            })`
        }
        if (type === 'repay_withdraw' && isLeft) {
            return `Withdraw ETH (Available: ${getAvailableEth()})`
        }
        if (type === 'repay_withdraw' && singleSafe && !isLeft) {
            return `Repay ${COIN_TICKER} (Owe: ${formatNumber(
                getAvailableRai()
            )}, Available: ${
                Number(raiBalance.toString()) > 0.0001
                    ? formatNumber(raiBalance.toString())
                    : '< 0.0001'
            })`
        }
        return ''
    }

    const collateralRatio = getCollateralRatio(
        totalCollateral,
        totalDebt,
        currentPrice.liquidationPrice,
        liquidationCRatio
    )

    const liquidationPenaltyPercentage = getRatePercentage(
        liquidationPenalty,
        0
    )
    const liquidationPrice = getLiquidationPrice(
        totalCollateral,
        totalDebt,
        liquidationCRatio,
        currentRedemptionPrice
    )
    const isPassedValidation = () => {
        const availableEthBN = BigNumber.from(
            toFixedString(getAvailableEth().toString(), 'WAD')
        )
        const availableRaiBN = BigNumber.from(
            toFixedString(getAvailableRai().toString(), 'WAD')
        )

        const raiBalanceBN = raiBalance
            ? BigNumber.from(toFixedString(raiBalance.toString(), 'WAD'))
            : BigNumber.from('0')

        const leftInputBN = defaultSafe.leftInput
            ? BigNumber.from(toFixedString(defaultSafe.leftInput, 'WAD'))
            : BigNumber.from('0')

        const rightInputBN = defaultSafe.rightInput
            ? BigNumber.from(toFixedString(defaultSafe.rightInput, 'WAD'))
            : BigNumber.from('0')

        const debtFloorBN = BigNumber.from(toFixedString(debtFloor, 'WAD'))
        const totalDebtBN = BigNumber.from(toFixedString(totalDebt, 'WAD'))

        // const debtCeilingBN = BigNumber.from(toFixedString(debtCeiling, 'RAD'))
        // const globalDebtCeilingBN = globalDebtCeiling
        //     ? BigNumber.from(toFixedString(globalDebtCeiling, 'RAD'))
        //     : BigNumber.from('0')

        if (type === 'deposit_borrow') {
            if (leftInputBN.gt(availableEthBN)) {
                setError('Insufficient balance.')
                return false
            } else if (rightInputBN.gt(availableRaiBN)) {
                setError(
                    `${COIN_TICKER} borrowed cannot exceed available amount.`
                )
                return false
            } else if (isCreate) {
                if (leftInputBN.isZero()) {
                    setError('Please enter the amount of ETH to be deposited.')
                    return false
                }
            } else {
                if (leftInputBN.isZero() && rightInputBN.isZero()) {
                    setError(
                        `Please enter the amount of ETH to be deposited or amount of ${COIN_TICKER} to be borrowed`
                    )
                    return false
                }
            }
        }
        if (type === 'repay_withdraw') {
            if (leftInputBN.isZero() && rightInputBN.isZero()) {
                setError(
                    `Please enter the amount of ETH to free or the amount of ${COIN_TICKER} to repay`
                )
                return false
            } else if (leftInputBN.gt(availableEthBN)) {
                setError('ETH to unlock cannot exceed available amount.')
                return false
            }
            if (rightInputBN.gt(availableRaiBN)) {
                setError(`${COIN_TICKER} to repay cannot exceed owed amount.`)
                return false
            }

            if (!rightInputBN.isZero()) {
                const repayPercent = returnPercentAmount(
                    defaultSafe.rightInput,
                    getAvailableRai() as string
                )

                if (
                    rightInputBN.lt(BigNumber.from(availableRaiBN)) &&
                    repayPercent > 95
                ) {
                    setError(
                        `You can only repay a minimum of ${getAvailableRai()} ${COIN_TICKER} to avoid leaving residual values`
                    )
                    return false
                }
            }

            if (!rightInputBN.isZero() && rightInputBN.gt(raiBalanceBN)) {
                setError(`balance_issue`)
                return false
            }
        }

        if (!isCreate) {
            const perSafeDebtCeilingBN = BigNumber.from(
                toFixedString(perSafeDebtCeiling, 'WAD')
            )
            if (totalDebtBN.gte(perSafeDebtCeilingBN)) {
                setError(
                    `Individual safe can't have more than ${perSafeDebtCeiling} ${COIN_TICKER} of debt.`
                )
                return
            }
        }

        if (!totalDebtBN.isZero() && totalDebtBN.lt(debtFloorBN)) {
            setError(
                `The resulting debt should be at least ${Math.ceil(
                    Number(formatNumber(debtFloor))
                )} ${COIN_TICKER} or zero.`
            )
            return false
        }

        const isSafe = safeIsSafe(
            totalCollateral,
            totalDebt,
            currentPrice.safetyPrice
        )

        if (!isSafe && (collateralRatio as number) >= 0) {
            setError(
                `Too much debt, below ${
                    Number(safetyCRatio) * 100
                }% collateralization ratio`
            )
            return false
        }

        if (numeral(totalDebt).value() > numeral(globalDebtCeiling).value()) {
            setError('Cannot exceed global debt ceiling.')
            return false
        }

        if (numeral(totalDebt).value() > numeral(debtCeiling).value()) {
            setError(`Cannot exceed ${COIN_TICKER} debt ceiling.`)
            return false
        }

        if (!proxyAddress) {
            setError(
                'You do not have a proxy address, Create a Reflexer Account to continue'
            )
            return
        }

        return true
    }

    const passedCheckForCoinAllowance = () => {
        const coinAllowance = connectWalletState.coinAllowance
        const rightInputBN = defaultSafe.rightInput
            ? BigNumber.from(toFixedString(defaultSafe.rightInput, 'WAD'))
            : BigNumber.from('0')
        if (coinAllowance) {
            const coinAllowanceBN = BigNumber.from(
                toFixedString(coinAllowance, 'WAD')
            )
            return coinAllowanceBN.gte(rightInputBN)
        }
        return false
    }

    const returnMaxRepayValue = () => {
        const rightInputBN = defaultSafe.rightInput
            ? BigNumber.from(toFixedString(defaultSafe.rightInput, 'WAD'))
            : BigNumber.from('0')

        const raiBalanceBN = BigNumber.from(
            toFixedString(raiBalance.toString(), 'WAD')
        )

        const diff = gebUtils
            .wadToFixed(rightInputBN.sub(raiBalanceBN))
            .toString()

        return `Insufficient balance. You are ${diff} short`
    }

    const submitDefaultValues = () => {
        const passedValidation = isPassedValidation()
        if (passedValidation) {
            if (!defaultSafe.leftInput) {
                defaultSafe.leftInput = '0'
            }
            if (!defaultSafe.rightInput) {
                defaultSafe.rightInput = '0'
            }

            safeActions.setSafeData({
                ...defaultSafe,
                totalCollateral,
                totalDebt,
                collateralRatio: collateralRatio as number,
                liquidationPrice: liquidationPrice as number,
            })

            safeActions.setIsUniSwapPoolChecked(checkUniSwapPool)
            const isPassed = passedCheckForCoinAllowance()

            if (checkUniSwapPool) {
                safeActions.setStage(1)
            } else if (
                type === 'repay_withdraw' &&
                Number(defaultSafe.rightInput) > 0 &&
                !isPassed
            ) {
                safeActions.setStage(2)
            } else {
                safeActions.setStage(3)
            }
        }
    }

    const submitUniSwapPool = () => {
        safeActions.setUniSwapPool({
            ...uniSwapVal,
            collateralRatio: collateralRatio as number,
        })
        safeActions.setStage(3)
    }

    const handleCancel = () => {
        if (isChecked) {
            safeActions.setStage(0)
        } else {
            safeActions.setIsUniSwapPoolChecked(false)
            safeActions.setStage(0)
            popupsActions.setSafeOperationPayload({
                isOpen: false,
                type: '',
                isCreate: false,
            })
            safeActions.setUniSwapPool(DEFAULT_SAFE_STATE)
            safeActions.setSafeData(DEFAULT_SAFE_STATE)
            setUniSwapVal(DEFAULT_SAFE_STATE)
            setDefaultSafe(DEFAULT_SAFE_STATE)
        }
    }

    const onChangeRight = (val: string) => {
        if (type === 'deposit_borrow') {
            if (
                val &&
                val.startsWith('0') &&
                val.length >= 5 &&
                Number(val) < 0.005
            ) {
                val = '0'
            }
        } else if (val && Number(val) < 0) {
            val = '0'
        }

        setDefaultSafe({
            ...defaultSafe,
            totalCollateral,
            totalDebt,
            rightInput: val,
        })
        if (error) {
            setError('')
        }
    }

    const onChangeLeft = (val: string) => {
        setDefaultSafe({
            ...defaultSafe,
            totalCollateral,
            totalDebt,
            leftInput: val,
        })
        if (error) {
            setError('')
        }
    }

    const handleMaxRai = () => {
        const availableRaiBN = BigNumber.from(
            toFixedString(getAvailableRai().toString(), 'WAD')
        )
        const raiBalanceBN = BigNumber.from(
            toFixedString(raiBalance.toString(), 'WAD')
        )

        const isMore = raiBalanceBN.gt(availableRaiBN)

        onChangeRight(
            isMore ? getAvailableRai().toString() : raiBalance.toString()
        )
    }

    useEffect(() => {
        setDefaultSafe(safeData)
        setUniSwapVal(uniSwapPool)
    }, [safeData, uniSwapPool])

    const returnStatus = useCallback(() => {
        if (!saviourData) return 'none'
        const minimumBalance = getMinSaviourBalance(
            saviourData.saviourRescueRatio,
            totalDebt,
            totalCollateral
        ) as number
        if (Number(saviourData.saviourBalance) >= minimumBalance) {
            return 'Protected'
        }
        return 'Unprotected'
    }, [getMinSaviourBalance, saviourData, totalCollateral, totalDebt])

    return (
        <>
            <Body>
                {saviourData && saviourData.hasSaviour ? (
                    <SaviourLabel>
                        <AlertLabel
                            text={`Saviour Status: ${returnStatus()}`}
                            type={
                                returnStatus() === 'Protected'
                                    ? 'success'
                                    : returnStatus() === 'none'
                                    ? 'dimmed'
                                    : 'danger'
                            }
                        />
                    </SaviourLabel>
                ) : null}
                <DoubleInput
                    className={type === 'repay_withdraw' ? 'reverse' : ''}
                >
                    <DecimalInput
                        data_test_id={`${type}_left`}
                        label={returnInputType()}
                        value={defaultSafe.leftInput}
                        onChange={onChangeLeft}
                        disabled={
                            isChecked || (type === 'repay_withdraw' && !isOwner)
                        }
                        disableMax={type !== 'repay_withdraw'}
                        handleMaxClick={() =>
                            onChangeLeft(getAvailableEth().toString())
                        }
                    />
                    <DecimalInput
                        data_test_id={`${type}_right`}
                        label={returnInputType(false)}
                        value={defaultSafe.rightInput}
                        onChange={onChangeRight}
                        disabled={
                            isChecked || (type === 'deposit_borrow' && !isOwner)
                        }
                        disableMax={type !== 'repay_withdraw'}
                        handleMaxClick={handleMaxRai}
                    />
                </DoubleInput>

                {error && (
                    <Error>
                        {error === 'balance_issue'
                            ? returnMaxRepayValue()
                            : error}
                    </Error>
                )}

                {isChecked ? (
                    <DoubleInput>
                        <DecimalInput
                            label={'ETH on Uniswap (Available 0.00)'}
                            value={uniSwapVal ? uniSwapVal.leftInput : ''}
                            onChange={() => {}}
                        />
                        <DecimalInput
                            label={`${COIN_TICKER} on Uniswap (Available ${getAvailableRai()})`}
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
                            <Label>{'Total ETH Collateral'}</Label>
                            <Value data-test-id="modal_collateral">{`${
                                totalCollateral ? totalCollateral : 0
                            }`}</Value>
                        </Item>
                        <Item>
                            <Label>{`Total ${COIN_TICKER} Debt`}</Label>{' '}
                            <Value data-test-id="modal_debt">{`${
                                totalDebt ? totalDebt : 0
                            }`}</Value>
                        </Item>
                        <Item>
                            <Label>{`ETH Price (OSM)`}</Label>{' '}
                            <Value data-test-id="modal_eth_price">{`$${formatNumber(
                                currentPrice.value,
                                2
                            )}`}</Value>
                        </Item>
                        <Item>
                            <Label>
                                {`${COIN_TICKER} Redemption Price`}
                                <InfoIcon data-tip={t('redemption_price_tip')}>
                                    <Info size="16" />
                                </InfoIcon>
                            </Label>{' '}
                            <Value data-test-id="modal_red_price">{`$${formatNumber(
                                currentRedemptionPrice,
                                3
                            )}`}</Value>
                        </Item>

                        <Item>
                            <Label>
                                {!isCreate
                                    ? 'New Collateral Ratio'
                                    : 'Collateral Ratio'}
                                <InfoIcon data-tip={t('collateral_ratio_tip')}>
                                    <Info size="16" />
                                </InfoIcon>
                            </Label>{' '}
                            <Value data-test-id="modal_col_ratio">{`${
                                collateralRatio > 0 ? collateralRatio : '∞'
                            }%`}</Value>
                        </Item>
                        <Item>
                            <Label>
                                {!isCreate
                                    ? 'New Liquidation Price'
                                    : 'Liquidation Price'}
                                <InfoIcon
                                    data-tip={t('liquidation_price_tip', {
                                        lr: LIQUIDATION_RATIO + '%',
                                    })}
                                >
                                    <Info size="16" />
                                </InfoIcon>
                            </Label>{' '}
                            <Value data-test-id="modal_liq_price">{`$${
                                liquidationPrice > 0
                                    ? (liquidationPrice as number) >
                                      Number(currentPrice.value)
                                        ? 'Invalid'
                                        : liquidationPrice
                                    : 0
                            }`}</Value>
                        </Item>
                        <Item>
                            <Label>
                                {'Liquidation Penalty'}
                                <InfoIcon
                                    data-tip={t('liquidation_penalty_tip')}
                                >
                                    <Info size="16" />
                                </InfoIcon>
                            </Label>{' '}
                            <Value data-test-id="modal_liq_penalty">{`${liquidationPenaltyPercentage}%`}</Value>
                        </Item>
                    </Block>
                    <ReactTooltip multiline type="light" data-effect="solid" />
                </Result>

                <Note data-test-id="debt_floor_note">
                    {isCreate
                        ? `Note: The minimum amount to mint per safe is ${Math.ceil(
                              Number(formatNumber(debtFloor))
                          )} RAI`
                        : null}
                </Note>

                {/*{isChecked ? null : (
          <UniSwapCheckContainer>
            <Text>{t('uniswap_modal_check_text',{coin_ticker: COIN_TICKER})}</Text>
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
                    onClick={
                        isChecked ? submitUniSwapPool : submitDefaultValues
                    }
                    text={t(
                        checkUniSwapPool && !isChecked
                            ? 'uniswap_pool'
                            : 'review_transaction'
                    )}
                />
            </Footer>
        </>
    )
}

export default SafeBody

const DoubleInput = styled.div`
    display: flex;
    margin-bottom: 16px;
    @media (min-width: 767px) {
        align-items: flex-end;
    }
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
`

const Result = styled.div`
    border-radius: ${(props) => props.theme.global.borderRadius};
    border: 1px solid ${(props) => props.theme.colors.border};
    background: ${(props) => props.theme.colors.foreground};
`

const Block = styled.div`
    border-bottom: 1px solid;
    padding: 16px 20px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    &:last-child {
        border-bottom: 0;
    }
`

const Item = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    &:last-child {
        margin-bottom: 0;
    }
`

const Label = styled.div`
    font-size: ${(props) => props.theme.font.small};
    color: ${(props) => props.theme.colors.secondary};
    letter-spacing: -0.09px;
    line-height: 21px;
    position: relative;
`

const Value = styled.div`
    font-size: ${(props) => props.theme.font.small};
    color: ${(props) => props.theme.colors.primary};
    letter-spacing: -0.09px;
    line-height: 21px;
    font-weight: 600;
`

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
    position: relative;
`

const Footer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 20px;
`

const Error = styled.p`
    color: ${(props) => props.theme.colors.dangerColor};
    font-size: ${(props) => props.theme.font.extraSmall};
    width: 100%;
    margin: 16px 0;
`

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

const InfoIcon = styled.div`
    position: absolute;
    top: 4px;
    right: -20px;
    cursor: pointer;
    svg {
        fill: ${(props) => props.theme.colors.secondary};
        color: ${(props) => props.theme.colors.neutral};
    }
`

const Note = styled.div`
    color: ${(props) => props.theme.colors.secondary};
    font-size: ${(props) => props.theme.font.extraSmall};
    margin-top: 5px;
`

const SaviourLabel = styled.div`
    position: absolute;
    top: -53px;
    right: 20px;
`
