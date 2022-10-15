import { 
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton, 
  Menu, 
  MenuButton, 
  MenuItem, 
  MenuList, 
  useColorModeValue,
  useDisclosure,
  Button,
  HStack, 
} from '@chakra-ui/react'
import i18next, { t } from 'i18next';
import { useRef, useState } from 'react';
import { FiGlobe } from 'react-icons/fi';

const SUPPORTED_LANGUAGES = ['en', 'ko', 'ja'];

export default function LanguageMenu({
  onLanguageChange,
  confirmBeforeLanguageChange,
}) {
  const [ language, setLanguage ] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const changeLanguage = (language) => {
    i18next.changeLanguage(language);
    if (onLanguageChange) {
      onLanguageChange(language);
    }
  };
  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<FiGlobe />}
          variant='ghost'
          py={2}
        />
        <MenuList borderColor={useColorModeValue('gray.200', 'gray.700')}>
          {SUPPORTED_LANGUAGES
            .map(supportedLanguage => (
              <MenuItem 
                isDisabled={i18next.resolvedLanguage === supportedLanguage}
                key={supportedLanguage} 
                onClick={() => {
                  if (confirmBeforeLanguageChange) {
                    setLanguage(supportedLanguage);
                    onOpen();
                  } else {
                    changeLanguage(supportedLanguage);
                  }
                }}
              >
                {t(supportedLanguage)}
              </MenuItem>))}
        </MenuList>
      </Menu>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          setLanguage(null);
          onClose();
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              {t('change_language', {language: t(language)})}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('change_language_confirm')}
            </AlertDialogBody>

            <AlertDialogFooter>
              <HStack spacing={4}>
                <Button ref={cancelRef} onClick={() => {
                  setLanguage(null);
                  onClose();
                }}>
                  {t('no')}
                </Button>
                <Button colorScheme='red' onClick={() => {
                  changeLanguage(language);
                  setLanguage(null);
                  onClose();
                }}>
                  {t('yes')}
                </Button>
              </HStack>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};