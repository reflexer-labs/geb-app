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
import { Minus, Plus } from 'react-feather';

interface Props {
  slapToBottom?: boolean;
}
const Footer = ({ slapToBottom }: Props) => {
  const { t } = useTranslation();
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const onChangeInput = (val: string) => {
    setEmail(val);
    setError('');
  };

  const onClickSubmit = () => {
    if (email && !isValidEmail(email)) {
      setError(t('invalid_email'));
      setIsSubmitting(false);
      return;
    }
    const formData = {
      EMAIL: email,
    };

    setIsSubmitting(true);

    jsonp(
      `${MAILCHIMP_URL}&${qs.stringify(formData)}`,
      {
        param: 'c',
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
    );
  };

  const handleClick = (group: number) => {
    if (group === selectedGroup) {
      setSelectedGroup(0);
    } else {
      setSelectedGroup(group);
    }
  };
  return (
    <Container className={slapToBottom ? 'fixBottom' : ''}>
      <UpperSection>
        <Company className="col40">
          <Brand height={30} />
          <Subscribe>
            <EmailInput
              disabled={error ? true : false}
              isSubmitting={isSubmitting}
              label={'Updates'}
              value={email}
              handleEmailClick={onClickSubmit}
              onChange={onChangeInput}
              error={error}
            />
            {showSuccess && <Success>{t('subscription_success')}</Success>}
          </Subscribe>
        </Company>
        <Column className="col20"></Column>
        <Column className={`col20 ${selectedGroup === 1 ? 'active' : ''}`}>
          <Header onClick={() => handleClick(1)}>
            Community{' '}
            {selectedGroup === 1 ? <Minus size={16} /> : <Plus size={16} />}
          </Header>
          <LinksContainer>
            <LinkBtn to={'https://discord.gg/83t3xKT'}>Discord</LinkBtn>
            <LinkBtn to={'https://twitter.com/MetaCoinProject'}>
              Twitter
            </LinkBtn>
            <LinkBtn to={'https://t.me/joinchat/Dp-hCVfCrf1zfCP5q2VI9w'}>
              Telegram
            </LinkBtn>
            <LinkBtn to={'https://medium.com/reflexer-labs'}>Medium</LinkBtn>
          </LinksContainer>
        </Column>
        <Column className={`col20 ${selectedGroup === 2 ? 'active' : ''}`}>
          <Header onClick={() => handleClick(2)}>
            Resources{' '}
            {selectedGroup === 2 ? <Minus size={16} /> : <Plus size={16} />}
          </Header>
          <LinksContainer>
            <LinkBtn
              to={
                'https://github.com/reflexer-labs/whitepapers/blob/master/English/rai-english.pdf'
              }
            >
              Whitepaper
            </LinkBtn>
            <LinkBtn
              to={
                'https://medium.com/reflexer-labs/stability-without-pegs-8c6a1cbc7fbd'
              }
            >
              TL;DR Reflex Index
            </LinkBtn>
            <LinkBtn to={'https://github.com/reflexer-labs'}>GitHub</LinkBtn>
          </LinksContainer>
        </Column>
      </UpperSection>
      <LowerSection>
        {/* <Button text={`Deployed Commit - master`} /> */}
        <Button text="© Reflexer Labs 2020" />
      </LowerSection>
    </Container>
  );
};

export default Footer;

const Container = styled.div`
  background: white;
  padding: 20px 80px 20px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 30px 30px;
  `}
`;

const LinksContainer = styled.div``;

const UpperSection = styled.div`
  display: flex;
  justify-content: space-between;

  .col40 {
    flex: 0 0 55%;
  }
  .col20 {
    flex: 0 0 15%;
    text-align: right;
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
  .col20 {
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
`;

const Subscribe = styled.div`
  margin-top: 20px;
`;

const Company = styled.div`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
 a > img {
  height:25px !important;
}
 `}
`;

const Column = styled.div``;

const Header = styled.h4`
  font-weight: 600;
  font-size: ${(props) => props.theme.font.default};
  line-height: 22px;
  letter-spacing: -0.18px;
  color: ${(props) => props.theme.colors.primary};
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
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
`;

const LinkBtn = styled(Link)`
  color: ${(props) => props.theme.colors.secondary};
  font-size: ${(props) => props.theme.font.default};
  line-height: 24px;
  letter-spacing: -0.18px;
  transition: all 0.3s ease;
  display: block;
  margin: 5px 0;
  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    text-decoration: underline;
    color: ${(props) => props.theme.colors.primary};
    svg {
      color: ${(props) => props.theme.colors.primary};
    }
  }
`;

const LowerSection = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  button {
    padding: 4px 8px;
    pointer-events: none;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
   margin-top: 30px;
   flex-direction:column;
   justify-content: flex-start;
   width:fit-content;
   button {
     margin-top:15px;
   }
  
  `}
`;

const Success = styled.p`
  color: ${(props) => props.theme.colors.successColor};
  font-size: ${(props) => props.theme.font.extraSmall};
`;
