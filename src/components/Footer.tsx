import React, { useState } from 'react'
import styled from 'styled-components'
import jsonp from 'jsonp'
import qs from 'query-string'
import ReactTooltip from 'react-tooltip'
import { isValidEmail } from '../utils/validations'
import { MAILCHIMP_URL } from '../utils/constants'
import { Minus, Plus } from 'react-feather'
import EmailInput from './EmailInput'
import Brand from './Brand'

interface Props {
    slapToBottom?: boolean
}
const Footer = ({ slapToBottom }: Props) => {
    const [selectedGroup, setSelectedGroup] = useState(0)
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const onChangeInput = (val: string) => {
        setEmail(val)
        setError('')
    }

    const onClickSubmit = () => {
        if (!email || !isValidEmail(email)) {
            setError('Please enter a valid email address')
            setIsSubmitting(false)
            return
        }
        const formData = {
            EMAIL: email,
        }

        setIsSubmitting(true)

        jsonp(
            `${MAILCHIMP_URL}&${qs.stringify(formData)}`,
            {
                param: 'c',
            },
            (err, data) => {
                if (err) {
                    setError(err.message)
                } else if (data.result !== 'success') {
                    setError(data.msg)
                } else {
                    setEmail('')
                    setShowSuccess(true)

                    setTimeout(() => {
                        setShowSuccess(false)
                    }, 5000)
                }

                setIsSubmitting(false)
            }
        )
    }

    const handleClick = (group: number) => {
        if (group === selectedGroup) {
            setSelectedGroup(0)
        } else {
            setSelectedGroup(group)
        }
    }

    return (
        <Container className={`wow fadeIn ${slapToBottom ? 'fixBottom' : ''}`}>
            <Inner>
                <UpperSection>
                    <Company className="col20">
                        <BrandContainer>
                            <Brand />
                        </BrandContainer>
                    </Company>

                    <Column
                        className={`col ${selectedGroup === 1 ? 'active' : ''}`}
                    >
                        <Header onClick={() => handleClick(1)}>
                            Project{' '}
                            {selectedGroup === 1 ? (
                                <Minus size={16} />
                            ) : (
                                <Plus size={16} />
                            )}
                        </Header>
                        <LinksContainer>
                            <LinkBtn
                                href={'https://github.com/reflexer-labs'}
                                target="_blank"
                            >
                                GitHub
                            </LinkBtn>
                            <LinkBtn
                                href={'https://docs.reflexer.finance/'}
                                target="_blank"
                            >
                                Docs
                            </LinkBtn>
                            <LinkBtn
                                href={
                                    'https://medium.com/reflexer-labs/stability-without-pegs-8c6a1cbc7fbd'
                                }
                                target="_blank"
                            >
                                RAI Explainer
                            </LinkBtn>
                            <LinkBtn
                                href={'https://memes.reflexer.finance'}
                                target="_blank"
                            >
                                Memes
                            </LinkBtn>
                        </LinksContainer>
                    </Column>
                    <Column
                        className={`col ${selectedGroup === 2 ? 'active' : ''}`}
                    >
                        <Header onClick={() => handleClick(2)}>
                            Community{' '}
                            {selectedGroup === 2 ? (
                                <Minus size={16} />
                            ) : (
                                <Plus size={16} />
                            )}
                        </Header>
                        <LinksContainer>
                            <LinkBtn
                                href={'https://discord.gg/bRmTxxW'}
                                target="_blank"
                            >
                                Discord
                            </LinkBtn>
                            <LinkBtn
                                href={'https://twitter.com/reflexerfinance'}
                                target="_blank"
                            >
                                Twitter
                            </LinkBtn>
                            <LinkBtn
                                href={'https://medium.com/reflexer-labs'}
                                target="_blank"
                            >
                                Medium
                            </LinkBtn>
                            <LinkBtn
                                href={'https://community.reflexer.finance/'}
                                target="_blank"
                            >
                                Forum
                            </LinkBtn>
                        </LinksContainer>
                    </Column>

                    <Column
                        className={`col ${selectedGroup === 3 ? 'active' : ''}`}
                    >
                        <Header onClick={() => handleClick(3)}>
                            Company{' '}
                            {selectedGroup === 3 ? (
                                <Minus size={16} />
                            ) : (
                                <Plus size={16} />
                            )}
                        </Header>
                        <LinksContainer>
                            <LinkBtn href={'https://reflexer.finance/about'}>
                                About
                            </LinkBtn>
                            <LinkBtn href={'https://reflexer.finance/faq'}>
                                FAQ
                            </LinkBtn>
                            <LinkBtn
                                href={'https://immunefi.com/bounty/reflexer/'}
                                target="_blank"
                            >
                                Bug Bounty
                            </LinkBtn>
                            <LinkBtn
                                href={'https://angel.co/company/reflexer-labs'}
                                target="_blank"
                            >
                                Jobs
                            </LinkBtn>
                        </LinksContainer>
                    </Column>

                    <Column
                        className={`col ${selectedGroup === 4 ? 'active' : ''}`}
                    >
                        <Header onClick={() => handleClick(4)}>
                            Legal{' '}
                            {selectedGroup === 4 ? (
                                <Minus size={16} />
                            ) : (
                                <Plus size={16} />
                            )}
                        </Header>
                        <LinksContainer>
                            <LinkBtn href="https://reflexer.finance/privacy">
                                Privacy Policy
                            </LinkBtn>
                            <TipBtn
                                data-tip={
                                    'Reflexer, FLX, and RAI, and the contents of the Reflexer Media Kit, are trademarks of Reflexer Labs, Inc. Use of this website and the Reflexer trademarks is not allowed for any purpose without the express, written permission of Reflexer.'
                                }
                            >
                                Legal Notices
                            </TipBtn>
                        </LinksContainer>
                    </Column>
                    <Column>
                        <Subscribe>
                            <Header>Stay Updated</Header>
                            <EmailInput
                                disabled={error ? true : false}
                                isSubmitting={isSubmitting}
                                label={''}
                                value={email}
                                handleEmailClick={onClickSubmit}
                                onChange={onChangeInput}
                                error={error}
                            />
                            {showSuccess && (
                                <Success>Confirmation email sent!</Success>
                            )}
                        </Subscribe>

                        <Cover>
                            <div>
                                <Header>Get Covered</Header>
                                <span>Powered by Nexus Mutual</span>
                            </div>
                            <div>
                                <img
                                    src={`${process.env.PUBLIC_URL}/img/nexus-cover.svg`}
                                    alt="mutual nexus"
                                />
                            </div>
                        </Cover>
                    </Column>
                </UpperSection>
            </Inner>
            <LowerSection>
                {`© Reflexer Labs ${new Date().getFullYear()}`}
            </LowerSection>
            <ReactTooltip
                multiline
                type="light"
                data-effect="float"
                place="top"
            />
        </Container>
    )
}

export default Footer

const Container = styled.div`
    background: ${(props) => props.theme.colors.foreground};
    position: relative;
`
const Inner = styled.div`
    max-width: 80vw;
    margin: 0 auto;
    padding: 60px 15px;
    ${({ theme }) => theme.mediaWidth.upToMedium`
 max-width: 100%;
 padding: 30px 15px;
`}
`

const BrandContainer = styled.div`
    text-align: left;
    img {
        max-width: 140px;
    }

    span {
        color: ${(props) => props.theme.colors.customSecondary};
        font-size: 14px;
        line-height: 1.6;
        display: block;
        margin-top: 15px;
    }
    ${({ theme }) => theme.mediaWidth.upToMedium`

 margin-bottom:20px;
 span {
   margin-top:10px;
 }
`}
`

const LinksContainer = styled.div``

const UpperSection = styled.div`
    display: flex;
    justify-content: space-between;

    .col40 {
        flex: 0 0 55%;
    }
    .col20 {
        flex: 0 0 15%;
        text-align: left;
    }
    ${({ theme }) => theme.mediaWidth.upToLarge`
     .col40 {
    flex: 0 0 40%;
  }
  .col20 {
    flex: 0 0 20%;
  }
  `}

    ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-content: flex-start;
    flex-direction: column;

     .col40 {
    flex: 0 0 100%;
    margin-bottom:10px;
  }
  .col {
    flex: 0 0 100%;
    text-align: left;
    margin-top:10px;
    ${LinksContainer}{
    display:none;
    }

  &.active {
    ${LinksContainer}{
    display:block;
   }
  }
    
  }
 
  `}
`

const Subscribe = styled.div`
    margin-top: 0;
    ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 25px;
  
  `}
`

const Company = styled.div`
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
 a > img {
  height:25px !important;
}
 `}
`

const Column = styled.div``

const Header = styled.h4`
    font-weight: 600;
    font-size: ${(props) => props.theme.font.default};
    line-height: 22px;
    letter-spacing: -0.18px;
    color: ${(props) => props.theme.colors.neutral};
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    svg {
        display: none;
    }
    ${({ theme }) => theme.mediaWidth.upToMedium`
    svg {
       display: block;
    }
    justify-content: flex-start;
    cursor:pointer;
  
  `}
`

const LinkBtn = styled.a`
    color: ${(props) => props.theme.colors.secondary};
    font-size: ${(props) => props.theme.font.small};
    line-height: 24px;
    letter-spacing: -0.18px;
    transition: all 0.3s ease;
    display: block;
    margin: 5px 0;
    cursor: pointer;
    &:last-child {
        margin-bottom: 0;
    }

    &:hover {
        text-decoration: underline;
        color: ${(props) => props.theme.colors.customSecondary};
        svg {
            color: ${(props) => props.theme.colors.primary};
        }
    }
`

const LowerSection = styled.div`
    text-align: center;
    background: ${(props) => props.theme.colors.background};
    padding: 15px;
    color: ${(props) => props.theme.colors.secondary};
`

const Success = styled.p`
    color: ${(props) => props.theme.colors.successColor};
    font-size: ${(props) => props.theme.font.extraSmall};
`

const TipBtn = styled.div`
    font-size: ${(props) => props.theme.font.small};
    line-height: 22px;
    margin: 5px 0;
    letter-spacing: -0.18px;
    color: ${(props) => props.theme.colors.secondary};
    transition: all 0.3s ease;
    display: block;
    cursor: pointer;
    &:hover {
        color: ${(props) => props.theme.colors.customSecondary};
        svg {
            color: ${(props) => props.theme.colors.primary};
        }
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-bottom: 20px;
      color: ${(props) => props.theme.colors.secondary};
     &:hover {
      text-decoration:none;
      
     }
   
  `}
`

const Cover = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 45px;
    ${Header} {
        margin-bottom: 3px;
    }
    span {
        font-size: ${(props) => props.theme.font.extraSmall};
        color: ${(props) => props.theme.colors.secondary};
    }

    img {
        max-width: 30px;
    }
    ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width:300px;
  `}
`
