import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import SettingsIcon from './Icons/SettingsIcon';
import SettingsContent from './SettingsContent';

const SettingsPopup = () => {
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClickOutside = (e: any) => {
    const wrapper: any = wrapperRef.current;
    if (!wrapper.contains(e.target)) {
      setTimeout(() => {
        setIsOpen(false);
      }, 10);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  return (
    <>
      <InnerContent ref={wrapperRef}>
        <SettingsButton onClick={() => setIsOpen(!isOpen)}>
          <SettingsIcon />
        </SettingsButton>
        <Menu className={isOpen ? 'isOpen' : ''}>
          <SettingsContent />
        </Menu>
      </InnerContent>
    </>
  );
};

export default SettingsPopup;

const InnerContent = styled.div`
  position: relative;
`;

const Menu = styled.div`
  background: ${(props) => props.theme.modalBg};
  border-radius: ${(props) => props.theme.buttonBorderRadius};
  border: 1px solid ${(props) => props.theme.borderColor};
  padding: 20px;
  display: none;
  position: absolute;
  top: 70px;
  right: 0;
  width: 300px;
  &.isOpen {
    display: block;
  }
`;

const SettingsButton = styled.button`
  background: ${(props) => props.theme.borderColor};
  box-shadow: none;
  outline: none;
  cursor: pointer;
  border: 0;
  color: ${(props) => props.theme.lightText};
  padding: 9px 10px;
  margin: 0;
  line-height: normal;
  border-radius: ${(props) => props.theme.buttonBorderRadius};
  transition: all 0.3s ease;
  position: relative;
  svg {
    width: 20px;
    height: 20px;
    display: block;
    color: ${(props) => props.theme.lightText};
  }

  &:hover {
    background: ${(props) => props.theme.lightText};
    svg {
      color: ${(props) => props.theme.borderColor};
    }
  }
`;
