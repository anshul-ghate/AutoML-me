import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface ModalitiesSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export const ModalitiesSelector: React.FC<ModalitiesSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  
  return (
    <FormControl fullWidth margin="normal">
      <InputLabel id="modality-label">{t('modality')}</InputLabel>
      <Select
        labelId="modality-label"
        value={value}
        label={t('modality')}
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="structured">{t('structured')}</MenuItem>
        <MenuItem value="text">{t('text')}</MenuItem>
        <MenuItem value="image">{t('image')}</MenuItem>
        <MenuItem value="audio">{t('audio')}</MenuItem>
      </Select>
    </FormControl>
  );
};
