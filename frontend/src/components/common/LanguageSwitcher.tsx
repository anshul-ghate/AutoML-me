import React from 'react';
import { 
  Select, 
  MenuItem, 
  FormControl, 
  Box,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from '../../i18n';

const LanguageSelect = styled(Select)(({ theme }) => ({
  minWidth: 120,
  '& .MuiSelect-select': {
    paddingY: theme.spacing(1),
    paddingX: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1)
  }
}));

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event: any) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <FormControl size="small">
      <LanguageSelect
        value={i18n.language}
        onChange={handleLanguageChange}
        displayEmpty
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>{lang.flag}</span>
              <Typography variant="body2">{lang.name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </LanguageSelect>
    </FormControl>
  );
};
