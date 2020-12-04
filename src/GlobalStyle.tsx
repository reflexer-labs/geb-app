import { createGlobalStyle, css } from 'styled-components';

interface Props {
  bodyOverflow?: boolean;
}

const GlobalStyle = createGlobalStyle`
        body {
          background:${(props) => props.theme.colors.foreground};
            overflow: ${(props: Props) =>
              props.bodyOverflow ? 'hidden' : 'visible'};

.web3modal-modal-lightbox {
  z-index: 999;

  .web3modal-modal-card {
    display:block;
    max-width:400px;
    .web3modal-provider-container {
      display:flex;
      flex-direction:row;
     justify-content:space-between;
     align-items:center;
     padding:16px;
      
     .web3modal-provider-name{
       font-size: 16px;
       width:auto;
     }

     .web3modal-provider-icon{
       order:2;
       width:30px;
       height:30px;

     }
      .web3modal-provider-description {
      display:none;
    }
    }
   
  }
}
.__react_component_tooltip {
    max-width: 250px;
    padding-top: 20px;
    padding-bottom: 20px;
    border-radius: 5px;
    opacity: 1 !important;
    background: ${(props) => props.theme.colors.neutral};
    border: ${(props) => props.theme.colors.border};
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.16);
  }
        }
`;

export const ExternalLinkArrow = css`
  border: 0;
  cursor: pointer;
  box-shadow: none;
  outline: none;
  padding: 0;
  margin: 0;
  background: ${(props) => props.theme.colors.gradient};
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: ${(props) => props.theme.colors.inputBorderColor};
  font-size: ${(props) => props.theme.font.small};
  font-weight: 600;
  line-height: 24px;
  letter-spacing: -0.18px;
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    &:hover {
      opacity: 0.5;
    }
  }
  transition: all 0.3s ease;
  &:hover {
    opacity: 0.8;
  }
  img {
    position: relative;
    top: 1px;
  }
`;

export default GlobalStyle;
