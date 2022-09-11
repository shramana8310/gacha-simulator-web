import { RepeatIcon } from '@chakra-ui/icons';
import {
  Button,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export default function ReloadButton({label, onClick, ...rest}) {
  const { t } = useTranslation();
  return <Button leftIcon={<RepeatIcon />} onClick={onClick} {...rest}>{label ? label : t('reload')}</Button>;
};
