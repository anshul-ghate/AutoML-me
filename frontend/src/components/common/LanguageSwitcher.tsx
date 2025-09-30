import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Button, 
  Menu, 
  MenuItem, 
  Box,
  Tooltip 
} from '@mui/material';
import { logUserAction } from '../../services/analytics';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng: string) => {
    const previousLanguage = i18n.language;
    i18n.changeLanguage(lng);
    
    logUserAction('language_changed', {
      from: previousLanguage,
      to: lng
    });
    
    handleClose();
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <Box>
      <Tooltip title="Change language">
        <Button 
          onClick={handleClick} 
          variant="outlined" 
          size="small"
          sx={{
            minWidth: 60,
            borderColor: 'rgba(255,255,255,0.3)',
            color: 'inherit',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.8)',
              bgcolor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
        </Button>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {languages.map((language) => (
          <MenuItem 
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            selected={language.code === i18n.language}
          >
            {language.flag} {language.name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
