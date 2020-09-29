import { createGlobalStyle } from 'styled-components';

interface Props {
  bodyOverflow?: boolean;
}

const GlobalStyle = createGlobalStyle`
        body {
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
        }
`;

export default GlobalStyle;
