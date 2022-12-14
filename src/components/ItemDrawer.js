import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Input,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Spinner,
  Button,
  Text,
  Stack,
  SimpleGrid,
  Center,
  Box,
  useToast,
} from '@chakra-ui/react';
import _ from 'lodash';
import Item from './Item';
import { useAuth } from "../auth/AuthContext";
import i18next from "i18next";
import { useTranslation } from "react-i18next";

const DEBOUNCE_MILISECONDS = 500;

function matchesSome(keyword, ...args) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'gi');
  return args.some((arg) => regex.test(arg));
}

export default function ItemDrawer({
  gameTitleSlug,
  drawerTitle,
  isOpen,
  onClose,
  fetchItems,
  selectMultipleItems,
  initialItems = [],
  onAddSelectedItems,
  onItemSelect,
}) {
  const { authService } = useAuth();
  const [searching, setSearching] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState(initialItems.map(item => ({
    ...item,
    checked: false,
  })));
  const firstField = useRef();
  const toast = useToast();
  const { t } = useTranslation();

  const searchItems = useMemo(() => _.debounce((keyword) => {
    const trimmedKeyword = keyword.trim();
    if (fetchItems && trimmedKeyword.length >= 2) {
      setSearching(true);
      setItems([]);
      fetch(`/api/game-titles/${gameTitleSlug}/items?name=${trimmedKeyword}`, {
        headers: {
          'Authorization': `Bearer ${authService.getAccessToken()}`,
          'Accept-Language': i18next.language,
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error();
        }
        return response.json();
      })
      .then(items => {
        setSearching(false);
        setItems(items.map(item => ({
          ...item,
          checked: false,
        })));
      })
      .catch(() => {
        setSearching(false);
        toast({
          title: t('error.fetch_fail_item_search'),
          status: 'error',
          isClosable: true,
        });
      });
    }
  }, DEBOUNCE_MILISECONDS), [authService, fetchItems, gameTitleSlug, toast, t]);

  const handleKeywordChange = useCallback((keyword) => {
    setKeyword(keyword);
    searchItems(keyword);
  }, [searchItems]);

  useEffect(() => {
    return () => {
      setItems(items => items.map(item => ({
        ...item,
        checked: false,
      })));
    };
  }, []);

  return (
    <Drawer 
      placement='right' 
      size='lg' 
      onClose={onClose} 
      isOpen={isOpen}
      initialFocusRef={firstField}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth='1px'>
          <Stack>
            <Text>{drawerTitle}</Text>
            <Input 
              value={keyword}
              placeholder={t('search')}
              ref={firstField}
              onChange={e => handleKeywordChange(e.target.value)}
            />
          </Stack>
        </DrawerHeader>
        <DrawerBody>
          {searching && <Center><Spinner /></Center>}
          <SimpleGrid marginTop={5} columns={{base: 2, md: 3, lg: 4}} spacing={2}>
            {items
            .map((item, i) => {
              if (!fetchItems && !matchesSome(keyword, item.name, item.shortName, item.shortNameAlt)) {
                return <Fragment key={item.id}></Fragment>;
              }
              if (selectMultipleItems) {
                return (
                  <Item
                    key={item.id}
                    item={item}
                    checkable={true}
                    checked={item.checked}
                    onCheck={() => setItems([
                      ...items.slice(0, i),
                      {
                        ...item,
                        checked: true,
                      },
                      ...items.slice(i+1),
                    ])}
                    onUncheck={() => setItems([
                      ...items.slice(0, i),
                      {
                        ...item,
                        checked: false,
                      },
                      ...items.slice(i+1),
                    ])}
                  />
                );
              } else {
                return (
                  <Box 
                    key={item.id}
                    _hover={{cursor: 'pointer'}} 
                    onClick={() => {
                      onClose();
                      onItemSelect(item);
                    }}
                  >
                    <Item item={item} />
                  </Box>
                );
              }
            })}
          </SimpleGrid>
        </DrawerBody>
        <DrawerFooter borderTopWidth='1px'>
          <Button variant='outline' mr={3} onClick={onClose}>{t('close')}</Button>
          {selectMultipleItems && 
          <Button 
            onClick={() => onAddSelectedItems(items.filter(item => item.checked))} 
            isDisabled={items.filter(item => item.checked).length === 0}
          >
            {t('add')}
          </Button>}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}