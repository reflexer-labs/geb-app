import { mediaWidthTemplates } from '../constants';
import { Theme } from '../interfaces';

const lightTheme: Theme = {
  colors: {
    primary: '#2A2A2A',
    secondary: '#A4ABB7',
    gradient: 'linear-gradient(225deg, #78D8FF 0%, #4CE096 100%)',
    neutral: '#ffffff',
    background: '#FDFDFD',
    overlay: 'rgba(0, 0, 0, 0.8)',
    border: '#EEF3F9',
    foreground: '#F8FAFD',
    dangerColor: '#721C24',
    dangerBackground: '#F8D7DA',
    dangerBorder: '#F5C6CB',
    alertColor: '#004085',
    alertBackground: '#CCE5FF',
    alertBorder: '#B8DAFF',
    successColor: '#155724',
    successBackground: '#D4EDDA',
    successBorder: '#C3E6CB',
    warningColor: '#856404',
    warningBackground: '#FFF3CD',
    warningBorder: '#856404',
    placeholder: '#EEF3F9',
    inputBorderColor: '#6fbcdb',
  },
  font: {
    extraSmall: '12px',
    small: '14px',
    default: '16px',
    medium: '18px',
    large: '20px',
    extraLarge: '22px',
  },
  global: {
    gridMaxWidth: '1500px',
    borderRadius: '4px',
    extraCurvedRadius: '20px',
    buttonPadding: '8px 16px',
    modalWidth: '720px',
  },
  mediaWidth: mediaWidthTemplates,
};

export { lightTheme };
