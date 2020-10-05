import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useStoreActions } from '../store';

const NavLinks = () => {
  const { t } = useTranslation();
  const { popupsModel: popupsActions } = useStoreActions((state) => state);
  return (
    <Nav>
      <NavBarLink to="">{t('incentives')}</NavBarLink>
      <NavBarLink to="">{t('voting')}</NavBarLink>
      <NavBarLink to="">{t('analytics')}</NavBarLink>
      <NavBarBtn
        className="settings-btn"
        onClick={() => popupsActions.setIsSettingModalOpen(true)}
      >
        {t('settings')}
      </NavBarBtn>
    </Nav>
  );
};

export default NavLinks;

const Nav = styled.div`
  display: flex;
  align-items: center;
  .settings-btn {
    display: none;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    .settings-btn {
      display: block;
    }
    flex-direction: column;
    a,
    div {
      flex: 0 0 100%;
      min-width: 100%;
      font-weight: normal;
      padding: 20px 18px;
      display: block;
      text-align: left;
      margin: 0;
      border-bottom: 1px solid ${(props) => props.theme.colors.border};
      &:first-child {
        border-top: 1px solid ${(props) => props.theme.colors.border};
      }
    }
  `}
`;

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
  margin-right: 20px;
  &:last-child {
    margin-right: 0;
  }
`;

const NavBarBtn = styled.div`
  background: none;
  box-shadow: none;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  border: 0;
  color: ${(props) => props.theme.colors.secondary};
  padding: 9px 10px;
  margin: 0;
  line-height: normal;
  text-align: left;
  transition: all 0.3s ease;
  &:hover {
    background: ${(props) => props.theme.colors.gradient};
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: ${(props) => props.theme.colors.inputBorderColor};
  }
`;
