import React, { useEffect, useMemo, useRef } from 'react';
import { 
  Button, 
  ScaleFade, 
  Switch,
  FormControl,
  FormLabel,
  useDisclosure,
  SimpleGrid,
  useToast,
  Stack,
  Spacer,
  Flex,
  Divider,
} from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux';
import Item from "./Item"
import { useParams, useNavigate } from 'react-router-dom';
import { useGachaRequestForm } from '../utils/gachaHooks';
import { addItems, removeItem, setCustomizeItems, setItemRatio, setItemsHelpIndex, setShowHelp } from '../utils/gachaRequestFormSlice';
import ItemDrawer from './ItemDrawer';
import HelpPopover, { ConditionalHelpPopover } from './HelpPopover';
import { FormTemplateWrapper } from "./FormTemplate";
import ValidationErrorAlerts from './ValidationErrorAlerts';
import NavigationButtons from './NavigationButtons';
import { useTranslation } from 'react-i18next';

const HelpIndex = {
  CUSTOMIZE_ITEMS_SWITCH: 0,
  ADD_ITEM_BUTTON: 1,
  ITEM_RATIO: 2,
};

export default function ItemsForm() {
  const { gameTitleSlug } = useParams();
  const { gachaRequestForm, validationErrors } = useGachaRequestForm();
  const { showHelp, itemsHelpIndex } = useSelector((state) => state.gachaRequestForm);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();
  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const helpIndexFallback = useMemo(() => {
    if (itemsHelpIndex === HelpIndex.ITEM_RATIO && gachaRequestForm.items.length === 0) {
      return HelpIndex.ADD_ITEM_BUTTON;
    } else if (itemsHelpIndex === HelpIndex.ADD_ITEM_BUTTON && !gachaRequestForm.customizeItems) {
      return HelpIndex.CUSTOMIZE_ITEMS_SWITCH;
    } else {
      return itemsHelpIndex;
    }
  }, [itemsHelpIndex, gachaRequestForm]);
  const scrollRef = useRef();
  const { t } = useTranslation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, []);

  return (
    <FormTemplateWrapper title={t('items')} showHelpIcon={true} ref={scrollRef}>
      <ValidationErrorAlerts validationErrors={validationErrors} pageFilter="items" />
      <Stack spacing={5}>
        <FormControl as={Flex} alignItems='center'>
          <FormLabel mb='0'>
            {t('customize_items_q')}
          </FormLabel>
          <Spacer />
          <HelpPopover 
            isOpen={showHelp && helpIndexFallback === HelpIndex.CUSTOMIZE_ITEMS_SWITCH}
            header={t('help_popover.customize_items.header')}
            body={t('help_popover.customize_items.body')}
            onCloseBtnClick={() => dispatch(setShowHelp(false))}
            onPrevBtnClick={() => navigate("../tiers")}
            onNextBtnClick={() => {
              if (gachaRequestForm.customizeItems) {
                dispatch(setItemsHelpIndex(HelpIndex.ADD_ITEM_BUTTON));
              } else {
                navigate("../pricing");
              }
            }}
          >
            <Switch 
              isChecked={gachaRequestForm.customizeItems} 
              onChange={(e) => dispatch(setCustomizeItems({
                gameTitleSlug: gameTitleSlug,
                value: e.target.checked,
              }))} 
            />
          </HelpPopover>
        </FormControl>
        {gachaRequestForm.customizeItems && 
        <>
          <FormControl as={Flex} alignItems='center'>
            <FormLabel mb='0'>{t('selected_items')}</FormLabel>
            <Spacer />
            <HelpPopover
              isOpen={showHelp && helpIndexFallback === HelpIndex.ADD_ITEM_BUTTON}
              header={t('help_popover.add_items.header')}
              body={t('help_popover.add_items.body')}
              onCloseBtnClick={() => dispatch(setShowHelp(false))}
              onPrevBtnClick={() => {
                dispatch(setItemsHelpIndex(HelpIndex.CUSTOMIZE_ITEMS_SWITCH));
              }}
              onNextBtnClick={() => {
                if (gachaRequestForm.items.length > 0) {
                  dispatch(setItemsHelpIndex(HelpIndex.ITEM_RATIO));
                } else {
                  navigate("../pricing");
                }
              }}
            >
              <Button ref={btnRef} onClick={onOpen}>{t('add')}</Button>
            </HelpPopover>
          </FormControl>
          <SimpleGrid columns={{base: 2, md: 3, lg: 4}} spacing={2}>
            {gachaRequestForm.items.map((item, i) => (
              <ConditionalHelpPopover
                show={i === 0}
                isOpen={showHelp && helpIndexFallback === HelpIndex.ITEM_RATIO}
                header={t('help_popover.item_ratio.header')}
                body={t('help_popover.item_ratio.body')}
                onCloseBtnClick={() => dispatch(setShowHelp(false))}
                onPrevBtnClick={() => {
                  dispatch(setItemsHelpIndex(HelpIndex.ADD_ITEM_BUTTON));
                }}
                onNextBtnClick={() => {
                  navigate("../pricing");
                }}
                key={item.id}
              >
                <ScaleFade in={true} initialScale={0.9}>
                  <Item
                    {...item}
                    tierName={item.tier.shortName}
                    ratioEditable={true}
                    ratioMin={0}
                    ratioMax={10000}
                    onRatioChange={(_, value) => dispatch(setItemRatio({
                      gameTitleSlug: gameTitleSlug,
                      index: i,
                      value: value || 0,
                    }))}
                    closable={true}
                    onClose={() => dispatch(removeItem({
                      gameTitleSlug: gameTitleSlug,
                      item: item,
                    }))}
                  />
                </ScaleFade>
              </ConditionalHelpPopover>
            ))}
          </SimpleGrid>
          <ItemDrawer
            gameTitleSlug={gameTitleSlug}
            drawerTitle={t('search_items')}
            isOpen={isOpen} 
            onClose={onClose} 
            fetchItems={true}
            selectMultipleItems={true}
            onAddSelectedItems={selectedItems => {
              let filteredItems = selectedItems.filter(selectedItem => gachaRequestForm.items.every(item => item.id !== selectedItem.id));
              dispatch(addItems({
                gameTitleSlug: gameTitleSlug,
                items: filteredItems,
              }));
              toast({
                title: t('items_added', { count: filteredItems.length }),
                status: 'success',
                isClosable: true,
              });
            }}
          />
        </>}
      </Stack>
      <Divider />
      <NavigationButtons prevBtnLink="../tiers" nextBtnLink="../pricing" />
    </FormTemplateWrapper>
  );
}