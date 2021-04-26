import React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Button from './Button'

interface Props {
    hideFAQ: () => void
    type: 'DEBT' | 'SURPLUS'
}

interface FAQ {
    title: string
    desc: string
    image: string
}
interface FAQS {
    debt: Array<FAQ>
    surplus: Array<FAQ>
}

const AuctionsFAQ = ({ hideFAQ, type }: Props) => {
    const { t } = useTranslation()

    const faqs: FAQS = {
        debt: [
            {
                title: t('debt_auction_minting_flx_header'),
                desc: t('debt_auction_minting_flx_desc'),
                image: require('../assets/mine.svg'),
            },
            {
                title: t('debt_auction_how_to_bid'),
                desc: t('debt_auction_how_to_bid_desc'),
                image: require('../assets/bid.svg'),
            },
            {
                title: t('debt_auction_claim_tokens'),
                desc: t('debt_auction_claim_tokens_desc'),
                image: require('../assets/claim.svg'),
            },
        ],
        surplus: [
            {
                title: t('surplus_auction_minting_flx_header'),
                desc: t('surplus_auction_minting_flx_desc'),
                image: require('../assets/sell-rai.svg'),
            },
            {
                title: t('surplus_auction_how_to_bid'),
                desc: t('surplus_auction_how_to_bid_desc'),
                image: require('../assets/bid.svg'),
            },
            {
                title: t('surplus_auction_claim_tokens'),
                desc: t('surplus_auction_claim_tokens_desc'),
                image: require('../assets/claim.svg'),
            },
        ],
    }

    return (
        <HeroSection>
            <Header>
                How do RAI {type.toLowerCase()} auctions work?{' '}
                <Button text={t('hide_faq')} onClick={hideFAQ} />
            </Header>
            <Content>
                {faqs[type.toLowerCase() as 'debt' | 'surplus'].map(
                    (faq: FAQ) => (
                        <Col key={faq.title}>
                            <InnerCol>
                                <img src={faq.image} alt={faq.title} />
                                <SectionHeading>{faq.title}</SectionHeading>
                                <SectionContent>{faq.desc}</SectionContent>
                            </InnerCol>
                        </Col>
                    )
                )}
            </Content>
        </HeroSection>
    )
}

export default AuctionsFAQ

const HeroSection = styled.div`
    margin-bottom: 20px;
    margin-top: 30px;
    overflow: hidden;
`
const Header = styled.div`
    font-size: ${(props) => props.theme.font.large};
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
    cursor: pointer;
    button {
        margin-left: 10px;
        font-size: ${(props) => props.theme.font.extraSmall};
        min-width: auto !important;
        border-radius: 25px;
        padding: 2px 10px;
        background: linear-gradient(225deg, #4ce096 0%, #78d8ff 100%);
    }

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    flex-direction:column;
    margin-bottom:25px;
    button {
      margin-top:10px;
    }
  `}
`
const Content = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin: 0 -10px;

    ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction:column;
  `}
`
const SectionHeading = styled.div`
    font-size: ${(props) => props.theme.font.default};
    font-weight: bold;
`
const SectionContent = styled.div`
    margin-top: 10px;
    font-size: ${(props) => props.theme.font.small};
    line-height: 23px;
    color: #272727;
    text-align: left;
`

const Col = styled.div`
    flex: 0 0 33.3%;
    padding: 0 10px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 0 0 100%;
    margin-top:20px;
  `}
`

const InnerCol = styled.div`
    border: 1px solid ${(props) => props.theme.colors.border};
    background: ${(props) => props.theme.colors.background};
    border-radius: ${(props) => props.theme.global.borderRadius};
    height: 100%;
    padding: 20px;
    text-align: center;
    img {
        width: 40px;
        margin-bottom: 20px;
    }
`
