import {
  Container,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FaGithub } from 'react-icons/fa';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <Container
      mt={14}
      as={Stack}
      maxW={'5xl'}
      py={4}
      direction={{ base: 'column', md: 'row' }}
      spacing={4}
      justify={{ base: 'center', md: 'space-between' }}
      align={{ base: 'center', md: 'center' }}>
      <Text fontSize='xs' color='gray.500'>{t('disclaimer', {email: process.env.REACT_APP_AUTHOR_EMAIL})}</Text>
      <Stack direction={'row'} spacing={6}>
        <Link href={process.env.REACT_APP_GITHUB_URL} isExternal><FaGithub /></Link>
      </Stack>
    </Container>
  );
}