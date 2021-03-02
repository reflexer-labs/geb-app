import React from 'react'
import { DollarSign, Shield } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { NETWORK_ID } from '../connectors'
import { useStoreActions, useStoreState } from '../store'
import AnalyticsIcon from './Icons/AnalyticsIcon'
import AuctionIcon from './Icons/AuctionIcon'
import SafeIcon from './Icons/SafeIcon'

const NavLinks = () => {
    const { t } = useTranslation()
    const { popupsModel: popupsActions } = useStoreActions((state) => state)
    const { settingsModel: settingsState } = useStoreState((state) => state)

    const { isRPCAdapterOn } = settingsState

    const handleLinkClick = (
        e: React.MouseEvent<HTMLElement>,
        disable = false,
        externalLink = ''
    ) => {
        if (disable) {
            e.preventDefault()
        }
        popupsActions.setShowSideMenu(false)
        if (externalLink) {
            window.open(externalLink, '_blank')
            e.preventDefault()
        }
    }

    return (
        <Nav>
            <NavBarLink
                id="app-link"
                to="/"
                onClick={(e) => handleLinkClick(e, false)}
            >
                <SafeIcon className="opacity" /> {t('app')}
            </NavBarLink>
            {NETWORK_ID === 1 ? null : (
                <NavBarLink
                    id="incentives-link"
                    to="/incentives"
                    onClick={(e) => handleLinkClick(e, false)}
                >
                    <DollarSign size="18" /> {t('incentives')}
                </NavBarLink>
            )}
            {isRPCAdapterOn ? null : (
                <NavBarLink
                    to="/auctions"
                    onClick={(e) => handleLinkClick(e, false)}
                >
                    <AuctionIcon className="opacity" /> {t('auctions')}
                </NavBarLink>
            )}

            <Box className="has-menu">
                <LinkItem>
                    <Shield /> {t('insurance')}
                </LinkItem>
                <MenuBox className="menu-box">
                    {/* <ExtLink href="https://nexusmutual.io/" target="_blank">
                        Nexus Mutual{' '}
                        <img
                            src={require('../assets/dark-arrow.svg')}
                            alt="arrow"
                        />
                    </ExtLink> */}
                    <ExtLink
                        href="https://app.coverprotocol.com/app/marketplace/protocols/RAI"
                        target="_blank"
                    >
                        Cover Protocol
                        <img
                            src={require('../assets/dark-arrow.svg')}
                            alt="arrow"
                        />
                    </ExtLink>
                </MenuBox>
            </Box>
            <NavBarLink
                to="/"
                onClick={(e) =>
                    handleLinkClick(
                        e,
                        false,
                        NETWORK_ID === 1
                            ? 'https://stats.reflexer.finance/'
                            : 'https://stats-kovan.reflexer.finance/'
                    )
                }
            >
                <AnalyticsIcon className="fill" /> {t('analytics')}
            </NavBarLink>

            {/* <SepBlock className="disableDesktop">
        <NavBarLink to="" onClick={(e) => handleLinkClick(e, false)}>
          {t('request_features')}
        </NavBarLink>

        <NavBarBtn
          onClick={() => {
            popupsActions.setShowSideMenu(false);
            popupsActions.setIsSettingModalOpen(true);
          }}
        >
          {t('settings')}
        </NavBarBtn>

        <NavBarLink to="" onClick={(e) => handleLinkClick(e, true)}>
          {t('talk_to_us')}
        </NavBarLink>
      </SepBlock> */}
        </Nav>
    )
}

export default NavLinks

const Nav = styled.div`
    display: flex;
    align-items: center;

    ${({ theme }) => theme.mediaWidth.upToSmall`
  
    flex-direction: column;
    
  `}
`

const NavBarLink = styled(NavLink)`
    color: ${(props) => props.theme.colors.secondary};
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
        background: ${(props) => props.theme.colors.gradient};
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        color: ${(props) => props.theme.colors.inputBorderColor};
    }

    svg {
        display: none;
        &.fill {
            fill: ${(props) => props.theme.colors.secondary};
        }
        &.opacity {
            opacity: 0.5;
        }
        ${({ theme }) => theme.mediaWidth.upToSmall`
   width: 18px;
         height: 18px;
         display: inline !important;
         margin-right:10px;
         color: ${(props) => props.theme.colors.secondary}
        `}
    }

    margin-right: 20px;
    &:last-child {
        margin-right: 0;
    }

    ${({ theme }) => theme.mediaWidth.upToSmall`
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  &:first-child {
    border-top: 1px solid ${(props) => props.theme.colors.border};
  }
      flex: 0 0 100%;
      min-width: 100%;
      font-weight: normal;
      padding: 15px 25px;
      display: flex;
      align-items:center;
      text-align: left;
      margin: 0;
      color :${(props) => props.theme.colors.primary};
    
  `}
`

const Box = styled.div`
    position: relative;
    cursor: pointer;
    &:hover {
        .menu-box {
            display: block;
        }
    }

    svg {
        display: none;
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
      border-bottom: 1px solid ${(props) => props.theme.colors.border};
      flex: 0 0 100%;
      min-width: 100%;
      font-weight: normal;
      padding: 15px 25px;
      svg {
        width: 18px;
         height: 18px;
         display: inline !important;
         margin-right:10px;
         color: ${(props) => props.theme.colors.secondary}
    }
    `}
`

const LinkItem = styled.div`
    color: ${(props) => props.theme.colors.secondary};
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 5px 0;
    margin-right: 20px;
    &:hover {
        background: ${(props) => props.theme.colors.gradient};
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        color: ${(props) => props.theme.colors.inputBorderColor};
        svg {
            color: ${(props) => props.theme.colors.secondary};
        }
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
        font-weight:normal;
    `}
`

const MenuBox = styled.div`
    display: none;
    position: absolute;
    top: 30px;
    z-index: 99;
    border-radius: 4px;
    background: #fff;
    padding: 20px;

    min-width: 200px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.06);
    ${({ theme }) => theme.mediaWidth.upToSmall`
        display:block;
        position:static;
        box-shadow:none;
        padding:0;
        margin-bottom:20px;
        padding-left:28px;
        margin-top:15px;
    `}
`

const ExtLink = styled.a`
    color: ${(props) => props.theme.colors.primary};
    font-size: 15px;
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
        text-decoration: none;
        transform: translateX(5px);
        color: ${(props) => props.theme.colors.secondary};
    }

    img {
        display: none;
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
        color: ${(props) => props.theme.colors.secondary};
        transform: translateX(0px) !important;
        img {
            display:inline;
            transform:rotate(180deg);
            margin-left:5px;
        }

    `}
`

// const NavBarBtn = styled.div`
//   background: none;
//   box-shadow: none;
//   font-weight: 600;
//   outline: none;
//   cursor: pointer;

//   border: 0;
//   color: ${(props) => props.theme.colors.secondary};
//   padding: 9px 10px;
//   margin: 0;
//   line-height: normal;
//   text-align: left;
//   transition: all 0.3s ease;
//   &:hover {
//     background: ${(props) => props.theme.colors.gradient};
//     background-clip: text;
//     -webkit-background-clip: text;
//     -webkit-text-fill-color: transparent;
//     color: ${(props) => props.theme.colors.inputBorderColor};
//   }
// `;

// const SepBlock = styled.div`
//   border-top: 1px solid ${(props) => props.theme.colors.border};
//   display: flex;
//   flex-direction: column;
//   padding: 10px 0 0 !important;
//   margin-top: 15px !important;
//   > div,
//   a {
//     padding-top: 10px;
//     padding-bottom: 10px;
//     color: ${(props) => props.theme.colors.secondary} !important;
//   }

//   @media (min-width: 768px) {
//     &.disableDesktop {
//       display: none;
//     }
//   }
// `;
