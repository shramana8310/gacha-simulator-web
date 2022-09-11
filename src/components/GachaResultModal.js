import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Skeleton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import GachaResult from './GachaResult';

const GachaResultModalTemplate = ({ isOpen, onClose, onClickRetry, loading, children }) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('result')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {children}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} colorScheme='blue' mr={3}>
          {t('close')}
          </Button>
          <Button onClick={onClickRetry} variant='ghost' isDisabled={loading}>
          {t('retry')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default function GachaResultModal({
  isOpen,
  onClose,
  onClickRetry,
  loading,
  error,
  ...rest
}) {
  const { t } = useTranslation();
  if (error) {
    return <GachaResultModalTemplate isOpen={isOpen} onClose={onClose} onClickRetry={onClickRetry} loading={loading}>
      <Alert status='error'>
        <AlertIcon />
        {t('error.fetch_fail_gacha')}
      </Alert>
    </GachaResultModalTemplate>;
  }
  return <GachaResultModalTemplate isOpen={isOpen} onClose={onClose} onClickRetry={onClickRetry} loading={loading}>
    <Skeleton isLoaded={!loading}><GachaResult {...rest} /></Skeleton>
  </GachaResultModalTemplate>;
};