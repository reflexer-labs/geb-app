import { createGlobalStyle } from 'styled-components';

interface Props {
  bodyOverflow?: boolean;
}

const GlobalStyle = createGlobalStyle`
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
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
        }

.three-line-legend {
	width: 100%;
	height: 70px;
	position: absolute;
	padding: 8px;
	font-size: 12px;
	color: #20262E;
	background-color: rgba(255, 255, 255, 0.23);
	text-align: left;
	z-index: 10;
  pointer-events: none;
}

.three-line-legend-dark {
	width: 100%;
	height: 70px;
	position: absolute;
	padding: 8px;
	font-size: 12px;
	color: white;
	background-color: rgba(255, 255, 255, 0.23);
	text-align: left;
	z-index: 10;
  pointer-events: none;
}

@media screen and (max-width: 800px) {
  .three-line-legend {
    display: none !important;
  }
}

.tv-lightweight-charts{
  width: 100% !important;
  

  & > * {
    width: 100% !important;
  }
}

`;

export default GlobalStyle;
