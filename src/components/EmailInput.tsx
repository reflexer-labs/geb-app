import React, { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Button from './Button';
import Loader from './Loader';

interface Props {
  label: string;
  error?: string;
  icon?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  handleEmailClick?: () => void;
  disabled: boolean;
  isSubmitting: boolean;
}

const EmailInput = ({
  label,
  placeholder,
  icon,
  value,
  onChange,
  disabled,
  handleEmailClick,
  error,
  isSubmitting
}: Props) => {
  const { t } = useTranslation();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
  };

  return (
    <Container>
      <Label>{label}</Label>
      <Content>
        {icon ? <Icon src={icon} /> : null}
        <CustomInput
          placeholder={placeholder || 'Enter your email'}
          type={'text'}
          value={value || ''}
          onChange={handleChange}
        />
        {isSubmitting ? <Loader /> :(
          <Button
            withArrow
            disabled={disabled}
            text={t('submit')}
            onClick={handleEmailClick}
          />
        )}

      </Content>
      {error && <Error dangerouslySetInnerHTML={{ __html: error }} />}
    </Container>
  );
};

export default EmailInput;

const Container = styled.div`
  max-width: 300px;
`;

const Label = styled.div`
  line-height: 21px;
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.small};
  letter-spacing: -0.09px;
  margin-bottom: 4px;
  text-transform: capitalize;
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.global.borderRadius};
  transition: all 0.3s ease;
  background: ${(props) => props.theme.colors.foreground};
  padding: 12px 16px;
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  margin-left: 20px;
`;

const CustomInput = styled.input`
  font-size: ${(props) => props.theme.font.small};
  transition: all 0.3s ease;
  width: 100%;
  border: none;
  border-radius: 0;
  background: ${(props) => props.theme.colors.foreground};
  color: ${(props) => props.theme.colors.primary};
  line-height: 21px;
  outline: none;
  &:disabled {
    cursor: not-allowed;
  }
`;

const Error = styled.p`
  color: ${(props) => props.theme.colors.dangerColor};
  font-size: ${(props) => props.theme.font.extraSmall};
`;