import { 
  IconButton, 
  Menu, 
  MenuButton, 
  MenuItem, 
  MenuList, 
  useColorModeValue, 
} from '@chakra-ui/react'
import i18next from 'i18next';
import { FiGlobe } from 'react-icons/fi';

const SUPPORTED_LANGUAGES = [
  {lng: 'en', name: 'English'},
  {lng: 'ko', name: '한국어'},
  {lng: 'ja', name: '日本語'},
];

export default function LanguageMenu({onLanguageChange}) {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={<FiGlobe />}
        variant='ghost'
        py={2}
      />
      <MenuList borderColor={useColorModeValue('gray.200', 'gray.700')}>
        {SUPPORTED_LANGUAGES
          .map(language => (
            <MenuItem 
              isDisabled={i18next.resolvedLanguage === language.lng}
              key={language.lng} 
              onClick={() => {
                i18next.changeLanguage(language.lng);
                if (onLanguageChange) {
                  onLanguageChange(language.lng);
                }
              }}
            >
              {language.name}
            </MenuItem>))}
      </MenuList>
    </Menu>
  );
};