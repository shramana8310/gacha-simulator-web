import React, { useState } from 'react';
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  HStack,
  Icon,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  useColorMode,
} from '@chakra-ui/react';
import { 
  HamburgerIcon,
} from '@chakra-ui/icons';
import { useNavigate, useParams } from "react-router-dom";
import { FiGlobe, FiMoon, FiSun } from 'react-icons/fi';
import i18next from 'i18next';
import { useDispatch } from 'react-redux';
import { clearGameTitleCache } from '../redux/gameTitleSlice';
import { initializeGachaRequestForm } from '../redux/gachaRequestFormSlice';
import { useTranslation } from 'react-i18next';

export default function SidebarWithHeader({ linkItems, loaded, title, children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH="100vh">
      <SidebarContent
        loaded={loaded}
        title={title}
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
        linkItems={linkItems}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full">
        <DrawerContent>
          <SidebarContent loaded={loaded} title={title} onClose={onClose} linkItems={linkItems} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav loaded={loaded} title={title} onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
}

const SidebarContent = ({ loaded, title, onClose, linkItems, ...rest }) => {
  const { t } = useTranslation();
  return (
    <Box
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}>
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Skeleton isLoaded={loaded}>
          <Text fontSize="2xl" fontWeight="bold">
            {title ? title : t('title')}
          </Text>
        </Skeleton>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {linkItems.map((link) => (
        <NavItem 
          key={link.name} 
          icon={link.icon} 
          to={link.to}
          onClose={onClose}
        >
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};

const NavItem = ({ icon, to, children, onClose, ...rest }) => {
  const navigate = useNavigate();
  return (
    <Link onClick={() => {onClose(); navigate(to);}} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: 'blue.300',
          color: 'white',
        }}
        {...rest}>
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  );
};

const MobileNav = ({ loaded, title, onOpen, ...rest }) => {
  const dispatch = useDispatch();
  const { gameTitleSlug } = useParams();
  const { colorMode, toggleColorMode } = useColorMode();
  const supportedLanguages = [
    {lng: 'en', name: 'English'},
    {lng: 'ko', name: '한국어'},
    {lng: 'ja', name: '日本語'},
  ];
  const [detectedLanguage, setDetectedLanguage] = useState(supportedLanguages.find(language => i18next.language === language.lng));
  const { t } = useTranslation();
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}>
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label={t('open_menu')}
        icon={<HamburgerIcon />}
      />

      <Skeleton isLoaded={loaded}>
        <Text
          display={{ base: 'flex', md: 'none' }}
          fontSize="2xl"
          fontWeight="bold">
          {title ? title : t('title')}
        </Text>
      </Skeleton>

      <HStack>
        <IconButton 
          variant="ghost"
          onClick={toggleColorMode}
          icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
        />
        <Flex alignItems={'center'}>
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s">
              <HStack>
                <FiGlobe />
                {detectedLanguage && <Text fontSize="sm">{detectedLanguage.name}</Text>}
              </HStack>
            </MenuButton>
            <MenuList borderColor={useColorModeValue('gray.200', 'gray.700')}>
              {supportedLanguages
                .filter(language => language.lng !== i18next.language)
                .map(language => (<MenuItem key={language.lng} onClick={() => {
                  i18next.changeLanguage(language.lng);
                  setDetectedLanguage(language);
                  dispatch(clearGameTitleCache());
                  dispatch(initializeGachaRequestForm(gameTitleSlug));
                }}>{language.name}</MenuItem>))}
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};