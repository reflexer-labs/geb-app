import { createGlobalStyle } from 'styled-components';

interface Props {
  bodyOverflow?: boolean;
}

const GlobalStyle = createGlobalStyle`
        body {
            overflow: ${(props: Props) =>
              props.bodyOverflow ? 'hidden' : 'visible'}
        }
`;

export default GlobalStyle;
