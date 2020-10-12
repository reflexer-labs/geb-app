import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import jsonp from 'jsonp';
import qs from 'query-string';
import Brand from './Brand';
import EmailInput from './EmailInput';
import Button from './Button';
import { isValidEmail } from '../utils/validations';
import { MAILCHIMP_URL } from '../utils/constants';


const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const onChangeInput = (val: string) => {
    setEmail(val)
    if (val && !isValidEmail(val)) {
      setError(t('invalid_email'));
    } else {
      setError('')
    }
  }

  const onClickSubmit = () => {
    const formData = {
      EMAIL: email,
    };

    setIsSubmitting(true);

    jsonp(
      `${MAILCHIMP_URL}&${qs.stringify(formData)}`,
      {
        param: 'c'
      },
      (err, data) => {
        if (err) {
          setError(err.message);
        } else if (data.result !== 'success') {
          setError(data.msg);
        } else {
          setEmail('');
          setShowSuccess(true);

          setTimeout(() => {
            setShowSuccess(false);
          }, 5000);
        }

        setIsSubmitting(false);
      }
    )
  }

  const isDisabled = !isValidEmail(email)

  return (
    <Container>
      <Company>
        <Brand height={40.23} />
        <EmailInput
          disabled={isDisabled}
          isSubmitting={isSubmitting}
          label={'Updates'}
          value={email}
          handleEmailClick={onClickSubmit}
          onChange={onChangeInput}
          error={error}
          mt={3}
        />
        {showSuccess && <Success>{t('subscription_success')}</Success>}
      </Company>
      <Column className="text-right">
        <Header>Community</Header>
        <LinkBtn to={'https://discord.gg/83t3xKT'}>Discord</LinkBtn>
        <LinkBtn to={'https://twitter.com/MetaCoinProject'}>Twitter</LinkBtn>
        <LinkBtn to={'https://t.me/joinchat/Dp-hCVfCrf1zfCP5q2VI9w'}>Telegram</LinkBtn>
        <LinkBtn to={'https://medium.com/reflexer-labs'}>Medium</LinkBtn>
      </Column>
      <Column className="text-right">
        <Header>Resources</Header>
        <LinkBtn to={'https://github.com/reflexer-labs/whitepapers/blob/master/English/rai-english.pdf'}>Whitepaper</LinkBtn>
        <LinkBtn to={'https://medium.com/reflexer-labs/stability-without-pegs-8c6a1cbc7fbd'}>tldr; Reflex Bonds</LinkBtn>
        <LinkBtn to={'https://github.com/reflexer-labs'}>GitHub</LinkBtn>
      </Column>
      <Copyright>
        <Button text="© Reflexer Labs 2020" />
      </Copyright>
    </Container>
  );
};

export default Footer;

const Container = styled.div`
  background: white;
  display: flex;
  justify-content: space-between;
  position: absolute;
  left: 0px;
  bottom: 0px;
  padding: 40px 80px 100px;
  width: 100vw;
`;

const Company = styled.div`
  flex-basis: 65%;
`;

const Column = styled.div``;

const Header = styled.h4`
  font-weight: 600;
  font-size: ${(props) => props.theme.font.default};
  line-height: 22px;
  letter-spacing: -0.18px;
  color: ${(props) => props.theme.colors.primary};
  margin: 0;
`;

const LinkBtn = styled(Link)`
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.default};
  line-height: 24px;
  letter-spacing: -0.18px;
  transition: all 0.3s ease;
  display: block;
  margin: 8px 0;

  &:hover {
    text-decoration: underline;
    color: ${(props) => props.theme.colors.primary};
    svg {
      color: ${(props) => props.theme.colors.primary};
    }
  }
`;

const Copyright = styled.div`
  position: absolute;
  bottom: 16px;
  right: 80px;
  
  button {
    padding: 4px 8px;
    pointer-events: none;
  }
`;

const Success = styled.p`
  color: ${(props) => props.theme.colors.successColor};
  font-size: ${(props) => props.theme.font.extraSmall};
`;