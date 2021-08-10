import { BigNumber } from 'ethers'
import React, { useMemo, useState } from 'react'
import { PlusCircle } from 'react-feather'
import styled from 'styled-components'
import Button from '../../../components/Button'
import DecimalInput from '../../../components/DecimalInput'
import { useActiveWeb3React } from '../../../hooks'
import {
    useAllTokens,
    useCurrency,
    useMappedTokens,
} from '../../../hooks/Tokens'
import useGeb from '../../../hooks/useGeb'
import {
    useMintState,
    useV3DerivedMintInfo,
    useV3MintActionHandlers,
} from '../../../hooks/useLiquidity'
import {
    useAddLiquidity,
    useInputsHandlers,
    useLiquidityInfo,
} from '../../../hooks/useLiquidityPool'
import {
    ApprovalState,
    useTokenApproval,
} from '../../../hooks/useTokenApproval'
import { formatCurrencyAmount, formatNumber } from '../../../utils/helper'

type PoolType = 'RAI/ETH'

const FEE_AMOUNT = 3000

const AddLiquidity = () => {
    const mappedTokens = useMappedTokens()
    const [currentPool, setCurrentPool] = useState<PoolType>('RAI/ETH')

    const pair = useMemo(() => {
        return currentPool.split('/').map((symbol) => {
            const foundToken = mappedTokens.find(
                (token) => token.symbol?.toLowerCase() === symbol.toLowerCase()
            )
            if (foundToken) return foundToken.address
            return 'ETH'
        })
    }, [currentPool, mappedTokens])

    const currencyA = useCurrency(pair[0])
    const currencyB = useCurrency(pair[1])

    // keep track for UI display purposes of user selected base currency
    const baseCurrency = currencyA
    const quoteCurrency = useMemo(
        () =>
            currencyA && currencyB && baseCurrency
                ? baseCurrency.equals(currencyA)
                    ? currencyB
                    : currencyA
                : undefined,
        [currencyA, currencyB, baseCurrency]
    )

    const { independentField, typedValue, startPriceTypedValue } =
        useMintState()

    const {
        pool,
        ticks,
        dependentField,
        price,
        pricesAtTicks,
        parsedAmounts: parsedAmountsV3,
        currencyBalances: balances,
        position,
        noLiquidity,
        currencies,
        errorMessage,
        invalidPool,
        invalidRange,
        outOfRange,
        depositADisabled,
        depositBDisabled,
        invertPrice,
    } = useV3DerivedMintInfo(
        currencyA ?? undefined,
        currencyB ?? undefined,
        FEE_AMOUNT,
        baseCurrency ?? undefined,
        undefined
    )
    // console.log('====================================')
    // console.log('pool', pool)
    // console.log('====================================')
    // console.log('====================================')
    // console.log(ticks)
    // console.log('====================================')

    // console.log(balances)
    // console.log('====================================')
    // console.log(price?.invert().toSignificant(5))
    // console.log(price?.toSignificant(5))
    // console.log('====================================')
    // console.log(formatCurrencyAmount(balances.CURRENCY_A, 4))
    // console.log(formatCurrencyAmount(balances.CURRENCY_B, 4))

    const {
        onFieldAInput,
        onFieldBInput,
        onLeftRangeInput,
        onRightRangeInput,
        onStartPriceInput,
    } = useV3MintActionHandlers(noLiquidity)

    const isValid = !errorMessage && !invalidRange

    const { account } = useActiveWeb3React()
    const {
        error,
        balances: currencyBalances,
        parsedAmounts,
    } = useLiquidityInfo()
    const geb = useGeb()

    const { onEthInput, onRaiInput } = useInputsHandlers()

    const { addLiquidityCallback } = useAddLiquidity()

    const [depositApprovalState, approveDeposit] = useTokenApproval(
        parsedAmounts.raiAmount,
        'coin',
        geb?.contracts.uniswapV3TwoTrancheLiquidityManager.address,
        account as string
    )

    const ethValue = parsedAmounts.ethAmount
        ? Number(parsedAmounts.ethAmount) > 0
            ? (formatNumber(parsedAmounts.ethAmount) as string)
            : parsedAmounts.ethAmount
        : ''
    const raiValue = parsedAmounts.raiAmount
        ? Number(parsedAmounts.raiAmount) > 0
            ? (formatNumber(parsedAmounts.raiAmount) as string)
            : parsedAmounts.raiAmount
        : ''
    const liqBValue =
        parsedAmounts && parsedAmounts.totalLiquidity
            ? (formatNumber(parsedAmounts.totalLiquidity) as string)
            : '0'

    const onEthMaxAmount = () => onEthInput(currencyBalances.eth.toString())
    const onRaiMaxAmount = () => onRaiInput(currencyBalances.rai.toString())

    const handleAddLiquidity = async () => {
        try {
            await addLiquidityCallback()
            onEthInput('')
            onRaiInput('')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Container>
            <InputContainer>
                <InputLabel>
                    <img
                        src={require('../../../assets/rai-logo.svg').default}
                        alt=""
                    />
                    {`RAI (Available: ${formatNumber(
                        currencyBalances.rai.toString()
                    )})`}
                </InputLabel>
                <DecimalInput
                    value={raiValue}
                    onChange={onRaiInput}
                    handleMaxClick={onRaiMaxAmount}
                    label={''}
                />
            </InputContainer>
            <SeparatorIcon>
                <PlusCircle color={'#D8D6D6'} />
            </SeparatorIcon>
            <InputContainer>
                <InputLabel>
                    <img
                        src={require('../../../assets/eth-logo.png').default}
                        alt=""
                    />
                    {`ETH (Available: ${formatNumber(
                        currencyBalances.eth.toString()
                    )})`}
                </InputLabel>
                <DecimalInput
                    value={ethValue}
                    onChange={onEthInput}
                    handleMaxClick={onEthMaxAmount}
                    label={''}
                />
            </InputContainer>
            <Result>
                <Block>
                    <Item>
                        <Label>{`Total Liquidity`}</Label>
                        <Value>{liqBValue} RAI/ETH</Value>
                    </Item>
                </Block>
            </Result>
            <BtnContainer>
                {isValid &&
                (depositApprovalState === ApprovalState.PENDING ||
                    depositApprovalState === ApprovalState.NOT_APPROVED) ? (
                    <Button
                        style={{ width: '48%' }}
                        disabled={
                            !isValid ||
                            depositApprovalState === ApprovalState.PENDING
                        }
                        text={
                            depositApprovalState === ApprovalState.PENDING
                                ? 'Pending Approval..'
                                : 'Approve'
                        }
                        onClick={approveDeposit}
                    />
                ) : null}
                <Button
                    style={{
                        width:
                            !isValid ||
                            depositApprovalState === ApprovalState.UNKNOWN ||
                            depositApprovalState === ApprovalState.APPROVED
                                ? '100%'
                                : '48%',
                    }}
                    disabled={
                        !isValid ||
                        depositApprovalState === ApprovalState.NOT_APPROVED ||
                        depositApprovalState === ApprovalState.PENDING
                    }
                    text={error ? error : 'Supply'}
                    onClick={handleAddLiquidity}
                />
            </BtnContainer>
        </Container>
    )
}

export default AddLiquidity

const Container = styled.div``
const InputLabel = styled.div`
    line-height: 21px;
    color: ${(props) => props.theme.colors.secondary};
    font-size: ${(props) => props.theme.font.small};
    letter-spacing: -0.09px;
    margin-bottom: 8px;
    text-transform: capitalize;
    display: flex;
    align-items: center;
    img {
        width: 23px;
        margin-right: 5px;
    }
`

const InputContainer = styled.div``

const SeparatorIcon = styled.div`
    display: flex;
    justify-content: center;
    margin: 20px 0;
`

const Result = styled.div`
    margin-top: 20px;
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
`

const Value = styled.div`
    font-size: ${(props) => props.theme.font.small};
    color: ${(props) => props.theme.colors.primary};
    letter-spacing: -0.09px;
    line-height: 21px;
    font-weight: 600;
`

const BtnContainer = styled.div`
    text-align: center;
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`
