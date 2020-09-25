import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Caret from '../static/images/caret.png';

interface Props {
  itemSelected: string;
  items: Array<string>;
  getSelectedItem?: (item: string) => void;
  padding?: string;
  minWidth?: string;
  fontSize?: string;
  width?: string;
  extraWord?: string;
  label?: string;
}
const Dropdown = (props: Props) => {
  const wrapperRef = useRef(null);
  const {
    itemSelected,
    items,
    padding,
    minWidth,
    width,
    extraWord,
    fontSize,
    getSelectedItem,
    label,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(itemSelected);
  const handleItemClick = (item: string) => {
    setIsOpen(!isOpen);
    setSelectedItem(item);
    getSelectedItem && getSelectedItem(item);
  };

  const handleClickOutside = (event: any) => {
    const wrapper: any = wrapperRef.current;
    if (!wrapper.contains(event.target)) {
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

  useEffect(() => {
    setSelectedItem(itemSelected);
  }, [itemSelected]);

  return (
    <Container
      className={isOpen ? 'isOpen' : ''}
      style={{ width: width || '100%' }}
    >
      {label ? <Label>{label}</Label> : null}
      <InnerContainer ref={wrapperRef}>
        <DropdownBtn
          style={{
            padding: padding || '20px',
            fontSize: fontSize || '16px',
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text">
            <span>{extraWord}</span> {selectedItem}
          </span>

          <CaretIcon src={Caret} className={isOpen ? 'up' : ''} />
        </DropdownBtn>
        <DropdownMenu
          style={{
            display: isOpen ? 'block' : 'none',
            minWidth: minWidth || '100%',
          }}
        >
          {items.map((item: string, index: number) => (
            <DropDownItem key={index} onClick={() => handleItemClick(item)}>
              {item}
            </DropDownItem>
          ))}
        </DropdownMenu>
      </InnerContainer>
    </Container>
  );
};

export default Dropdown;

const Container = styled.div`
  display: inline-block;
  &.isOpen {
    position: relative;
    z-index: 1000;
  }
`;

const InnerContainer = styled.div`
  position: relative;
  z-index: 999;
`;
const DropdownBtn = styled.button`
  border: 1px solid ${(props) => props.theme.borderColor};
  box-shadow: none;
  background: ${(props) => props.theme.modalBg};
  color: ${(props) => props.theme.darkText};
  border-radius: ${(props) => props.theme.buttonBorderRadius};
  outline: none;
  text-align: left;
  cursor: pointer;
  width: 100%;
  display: flex;
  .text {
    display: inline-block;
    vertical-align: middle;
  }
`;

const CaretIcon = styled.img`
  margin-left: auto;
  display: inline-block;
  vertical-align: middle;
  position: relative;
  top: 7px;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  border-radius: ${(props) => props.theme.buttonBorderRadius};
  background: ${(props) => props.theme.modalBg};
  border: 1px solid ${(props) => props.theme.borderColor};
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.02);
  text-align: left;
  max-height: 350px;
  overflow-y: auto;
`;

const DropDownItem = styled.div`
  padding: 20px;
  color: ${(props) => props.theme.darkText};
  cursor: pointer;
  &:hover {
    background: ${(props) => props.theme.hoverEffect};
  }
`;

const Label = styled.div`
  line-height: 21px;
  color: ${(props) => props.theme.lightText};
  font-size: ${(props) => props.theme.textFontSize};
  letter-spacing: -0.09px;
  margin-bottom: 4px;
  text-transform: capitalize;
`;
