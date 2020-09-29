import React, { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props {
  label: string;
  icon?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  disableMax?: boolean;
  handleMaxClick?: () => void;
  disabled?: boolean;
  maxLength?: number;
}

const DecimalInput = ({
  label,
  placeholder,
  icon,
  value,
  onChange,
  disableMax,
  handleMaxClick,
  disabled,
  maxLength,
}: Props) => {
  const { t } = useTranslation();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^-?\d*[.,]?\d*$/.test(val) && /^\d*(\.\d{0,4})?$/.test(val)) {
      if (val.startsWith('0') && val.charAt(1) !== '.') {
        const returnedVal = val.replace(/(\d)(?=(\d))/, '$1.');
        onChange(returnedVal);
      } else if (val.length === 6 && Number(val) === 0) {
        onChange('');
      } else {
        onChange(val);
      }
    }
  };

  return (
    <Container>
      <Label>{label}</Label>
      <Content className={disabled ? 'disabled' : ''}>
        {icon ? <Icon src={icon} /> : null}
        <CustomInput
          placeholder={placeholder || '0.00'}
          type={'text'}
          inputMode="decimal"
          value={value || ''}
          pattern="^[0-9]*[.,]?[0-9]*$"
          maxLength={maxLength || 12}
          minLength={1}
          onChange={handleChange}
          disabled={disabled}
        />

        {disableMax || disabled ? null : (
          <MaxBtn onClick={handleMaxClick}>{t('max')}</MaxBtn>
        )}
      </Content>
    </Container>
  );
};

export default DecimalInput;

const Container = styled.div``;

const Label = styled.div`
  line-height: 21px;
  color: ${(props) => props.theme.lightText};
  font-size: ${(props) => props.theme.textFontSize};
  letter-spacing: -0.09px;
  margin-bottom: 4px;
  text-transform: capitalize;
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.buttonBorderRadius};
  transition: all 0.3s ease;
  &:hover {
    background: ${(props) => props.theme.hoverEffect};
  }
  &.disabled {
    cursor: not-allowed;
    background: ${(props) => props.theme.hoverEffect};
  }
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  margin-left: 20px;
`;

const CustomInput = styled.input`
  font-size: ${(props) => props.theme.defaultTextSize};
  transition: all 0.3s ease;
  width: 100%;
  border: none;
  border-radius: 0;
  padding: 20px;
  background: ${(props) => props.theme.modalBg};
  color: ${(props) => props.theme.darkText};
  line-height: 24px;
  outline: none;
  &:disabled {
    cursor: not-allowed;
    background: ${(props) => props.theme.hoverEffect};
  }
`;

const MaxBtn = styled.div`
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(props) => props.theme.lightText};
  padding: 6px;
  font-weight: 600;
  color: ${(props) => props.theme.neutral};
  font-size: ${(props) => props.theme.smallFontSize};
  border-radius: ${(props) => props.theme.buttonBorderRadius};
  margin-right: 20px;
  &:hover {
    background: ${(props) => props.theme.defaultGradient};
  }
`;
