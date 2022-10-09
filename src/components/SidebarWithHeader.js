import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  Skeleton,
  ButtonGroup,
  Spacer,
} from '@chakra-ui/react';
import { 
  HamburgerIcon,
} from '@chakra-ui/icons';
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { clearGameTitleCache } from '../utils/gameTitleSlice';
import { initializeGachaRequestForm } from '../utils/gachaRequestFormSlice';
import { useTranslation } from 'react-i18next';
import ColorModeToggleButton from './ColorModeToggleButton';
import LanguageMenu from './LanguageMenu';

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
      overflowY="auto"
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
  const { t } = useTranslation();
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      gap={4}
      {...rest}
    >

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

      <Spacer />

      <ButtonGroup gap='2'>
        <ColorModeToggleButton />
        <LanguageMenu onLanguageChange={() => {
          dispatch(clearGameTitleCache());
          dispatch(initializeGachaRequestForm(gameTitleSlug));
        }} />
      </ButtonGroup>

    </Flex>
  );
};