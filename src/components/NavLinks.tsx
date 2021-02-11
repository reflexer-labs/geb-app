import React from 'react'
import { DollarSign } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { NETWORK_ID } from '../connectors'
import { useStoreActions } from '../store'
import AnalyticsIcon from './Icons/AnalyticsIcon'
import SafeIcon from './Icons/SafeIcon'

const NavLinks = () => {
    const { t } = useTranslation()
    const { popupsModel: popupsActions } = useStoreActions((state) => state)

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
            <NavBarLink
                id="incentives-link"
                to="/incentives"
                onClick={(e) => handleLinkClick(e, false)}
            >
                <DollarSign size="18" /> {t('incentives')}
            </NavBarLink>
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

    svg {
        display: none;
    }
    ${({ theme }) => theme.mediaWidth.upToSmall`
  
    flex-direction: column;
    a,
    div {
      flex: 0 0 100%;
      min-width: 100%;
      font-weight: normal;
      padding: 15px 25px;
      display: flex;
      align-items:center;
      text-align: left;
      margin: 0;
      color :${(props) => props.theme.colors.primary};
      svg {
         width: 18px;
         height: 18px;
         display: inline;
         margin-right:10px;
         color: ${(props) => props.theme.colors.secondary}
      
        
      }
    }
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
        &.fill {
            fill: ${(props) => props.theme.colors.secondary};
        }
        &.opacity {
            opacity: 0.5;
        }
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
