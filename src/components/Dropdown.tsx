import React, { useState, useRef, useEffect } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import styled from 'styled-components';

type Item = string | { item: string; img: string };
interface Props {
  itemSelected: Item;
  items: Array<Item>;
  getSelectedItem?: (item: string) => void;
  padding?: string;
  minWidth?: string;
  fontSize?: string;
  width?: string;
  extraWord?: string;
  label?: string;
  itemPadding?: string;
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
    itemPadding,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item>(itemSelected);
  const handleItemClick = (selected: Item) => {
    setIsOpen(!isOpen);
    setSelectedItem(selected);
    if (typeof selected === 'string') {
      getSelectedItem && getSelectedItem(selected);
    } else {
      getSelectedItem && getSelectedItem(selected.item);
    }
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
            pointerEvents: items.length > 0 ? 'auto' : 'none',
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text">
            <span>{extraWord}</span>{' '}
            {typeof selectedItem === 'string' ? (
              selectedItem
            ) : (
              <ItemImg>
                <img src={selectedItem.img} alt="" /> {selectedItem.item}
              </ItemImg>
            )}
          </span>

          {items.length > 0 ? (
            <CaretIcon
              src={require('../assets/caret.png')}
              className={isOpen ? 'up' : ''}
            />
          ) : null}
        </DropdownBtn>
        {items.length > 0 ? (
          <DropdownMenu
            style={{
              display: isOpen ? 'block' : 'none',
              minWidth: minWidth || '100%',
            }}
          >
            <Scrollbars
              style={{ width: '100%' }}
              autoHeight
              autoHeightMax={185}
            >
              {items.map((item: Item, index: number) => (
                <DropDownItem
                  key={index}
                  onClick={() => handleItemClick(item)}
                  style={{ padding: itemPadding || '20px' }}
                >
                  {typeof item === 'string' ? (
                    item
                  ) : (
                    <ItemImg>
                      <img src={item.img} alt="" /> {item.item}
                    </ItemImg>
                  )}
                </DropDownItem>
              ))}
            </Scrollbars>
          </DropdownMenu>
        ) : null}
      </InnerContainer>
    </Container>
  );
};

export default Dropdown;

const Container = styled.div`
  display: inline-block;
  &.isOpen {
    position: relative;
    z-index: 305;
  }
`;

const InnerContainer = styled.div`
  position: relative;
  z-index: 300;
`;
const DropdownBtn = styled.button`
  border: 1px solid ${(props) => props.theme.colors.border};
  box-shadow: none;
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.global.borderRadius};
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
  height: 6px;
  width: 11px;
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
  border-radius: ${(props) => props.theme.global.borderRadius};
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.02);
  text-align: left;
  z-index: 5;
`;

const DropDownItem = styled.div`
  padding: 20px;
  color: ${(props) => props.theme.colors.primary};
  cursor: pointer;
  &:hover {
    background: ${(props) => props.theme.colors.foreground};
  }
`;

const Label = styled.div`
  line-height: 21px;
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.small};
  letter-spacing: -0.09px;
  margin-bottom: 4px;
  text-transform: capitalize;
`;

const ItemImg = styled.div`
  display: flex;
  align-items: center;
  img {
    margin-right: 10px;
  }
`;
