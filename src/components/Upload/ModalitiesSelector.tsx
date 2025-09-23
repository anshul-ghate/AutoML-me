import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface ModalitiesSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export const ModalitiesSelector: React.FC<ModalitiesSelectorProps> = ({ value, onChange }) => (
  <FormControl fullWidth margin="normal">
    <InputLabel id="modality-label">Modality</InputLabel>
    <Select
      labelId="modality-label"
      value={value}
      label="Modality"
      onChange={(e) => onChange(e.target.value)}
    >
      <MenuItem value="structured">Structured</MenuItem>
      <MenuItem value="text">Text</MenuItem>
      <MenuItem value="image">Image</MenuItem>
      <MenuItem value="audio">Audio</MenuItem>
    </Select>
  </FormControl>
);
