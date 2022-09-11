import { Alert, AlertIcon, Center, Link, Stack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";

export default function NotFoundAlert() {
  const { t } = useTranslation();
  return <Stack>
    <Alert status='error'>
      <AlertIcon  />
      {t('not_found')}
    </Alert>
    <Center><Link as={RouterLink} to={'/'}>{t('home')}</Link></Center>
  </Stack>;
};