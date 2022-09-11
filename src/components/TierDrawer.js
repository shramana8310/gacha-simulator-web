import React, { useState } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Text,
  ScaleFade,
  Stack,
  SimpleGrid,
} from '@chakra-ui/react';
import Tier from './Tier';
import { useTranslation } from "react-i18next";

export default function TierDrawer({
  onClose,
  isOpen,
  tiers,
  onAddSelectedTiers,
}) {
  const [checkableTiers, setCheckableTiers] = useState(tiers.map(tier => ({
    ...tier, 
    checked: false
  })));
  const { t } = useTranslation();

  return (
    <Drawer 
      placement='right' 
      size='lg' 
      onClose={onClose} 
      isOpen={isOpen}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth='1px'>
          <Stack>
            <Text>{t('select_tiers')}</Text>
          </Stack>
        </DrawerHeader>
        <DrawerBody>
          <SimpleGrid marginTop={5} columns={{base: 2, md: 3, lg: 4}} spacing={2}>
            {checkableTiers.map((tier, i) => 
              <ScaleFade initialScale={0.9} in={true} key={tier.id}>
                <Tier
                  {...tier}
                  checkable={true}
                  checked={tier.checked}
                  onCheck={() => setCheckableTiers([
                    ...checkableTiers.slice(0, i),
                    {
                      ...tier,
                      checked: true,
                    },
                    ...checkableTiers.slice(i+1),
                  ])}
                  onUncheck={() => setCheckableTiers([
                    ...checkableTiers.slice(0, i),
                    {
                      ...tier,
                      checked: false,
                    },
                    ...checkableTiers.slice(i+1),
                  ])}
                />
              </ScaleFade>)}
          </SimpleGrid>
        </DrawerBody>
        <DrawerFooter borderTopWidth='1px'>
          <Button variant='outline' mr={3} onClick={onClose}>{t('close')}</Button>
          <Button 
            onClick={() => onAddSelectedTiers(checkableTiers.filter(tier => tier.checked))} 
            isDisabled={checkableTiers.filter(tier => tier.checked).length === 0}
          >
            {t('add')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};