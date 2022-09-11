import { 
  FormControl, 
  Stack,
  Flex,
  Spacer,
  FormLabel,
  Select,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,  
  Button,
  SimpleGrid,
  useDisclosure,
  ScaleFade,
  useToast,
} from '@chakra-ui/react'
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  addWantedItems, 
  addWantedTiers, 
  removeWantedItem, 
  removeWantedTier, 
  setBudget, 
  setItemGoals, 
  setMaxConsecutiveGachas, 
  setPlan, 
  setPlanHelpIndex, 
  setPlanPresets, 
  setPlanPresetsError, 
  setPlanPresetsLoaded, 
  setShowHelp, 
  setTierGoals, 
  setWantedItemNumber, 
  setWantedTierNumber, 
} from '../redux/gachaRequestFormSlice';
import Item from './Item';
import Tier from './Tier';
import ItemDrawer from './ItemDrawer';
import TierDrawer from './TierDrawer';
import useGachaRequestForm from '../redux/useGachaRequestForm';
import HelpPopover from './HelpPopover';
import ValidationErrorAlerts from './ValidationErrorAlerts';
import NavigationButtons from './NavigationButtons';
import { useAuth } from 'react-oauth2-pkce';
import FormTemplate from './FormTemplate';
import WarnAlert from './WarnAlert';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

const HelpIndex = {
  PRESETS: 0,
  BUDGET: 1,
  MAX_CONSECUTIVE_GACHAS: 2,
  ITEM_GOALS: 3,
  ITEM_ADD: 4,
  ITEM_NUMBER: 5,
  TIER_GOALS: 6,
  TIER_ADD: 7,
  TIER_NUMBER: 8,
};

export default function PlanForm() {
  const { authService } = useAuth();
  const { gameTitleSlug } = useParams();
  const { gachaRequestForm, validationErrors } = useGachaRequestForm();
  const { showHelp, planHelpIndex } = useSelector((state) => state.gachaRequestForm);
  const itemDrawerDisclosure = useDisclosure();
  const tierDrawerDisclosure = useDisclosure();
  const itemBtnRef = useRef();
  const tierBtnRef = useRef();
  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const filteredWantedItems = gachaRequestForm.plan.wantedItems.filter((wantedItem) => gachaRequestForm.customizeItems ? gachaRequestForm.items.some(item => item.id === wantedItem.id) : true);
  const filteredWantedTiers = gachaRequestForm.plan.wantedTiers.filter((wantedTier) => gachaRequestForm.customizeItems ? gachaRequestForm.items.some(item => item.tier.id === wantedTier.id) : true);
  const helpIndexFallback = useMemo(() => {
    if (planHelpIndex === HelpIndex.TIER_NUMBER || planHelpIndex === HelpIndex.TIER_ADD) {
      if (gachaRequestForm.plan.tierGoals) {
        if (filteredWantedTiers.length === 0) {
          return HelpIndex.TIER_ADD;
        } else {
          return planHelpIndex;
        }
      } else {
        return HelpIndex.TIER_GOALS;
      }
    } else if (planHelpIndex === HelpIndex.ITEM_NUMBER || planHelpIndex === HelpIndex.ITEM_ADD) {
      if (gachaRequestForm.plan.itemGoals) {
        if (filteredWantedItems.length === 0) {
          return HelpIndex.ITEM_ADD;
        } else {
          return planHelpIndex;
        }
      } else {
        return HelpIndex.ITEM_GOALS;
      }
    } else {
      return planHelpIndex;
    }  
  }, [planHelpIndex, gachaRequestForm, filteredWantedTiers, filteredWantedItems]);
  const { t } = useTranslation();

  const loadPlanPresets = useCallback(() => {
    dispatch(setPlanPresetsLoaded({
      gameTitleSlug: gameTitleSlug,
      value: false,
    }));
    fetch(`/api/game-titles/${gameTitleSlug}/plans`, {
      headers: {
        'Authorization': `Bearer ${authService.getAuthTokens().access_token}`,
        'Accept-Language': i18next.language,
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error();
      }
      return response.json();
    })
    .then(planPresets => {
      dispatch(setPlanPresets({
        gameTitleSlug: gameTitleSlug,
        planPresets: planPresets,
      }));
      dispatch(setPlanPresetsLoaded({
        gameTitleSlug: gameTitleSlug,
        value: true,
      }));
      dispatch(setPlanPresetsError({
        gameTitleSlug: gameTitleSlug,
        value: false,
      }));
    })
    .catch(() => {
      dispatch(setPlanPresetsLoaded({
        gameTitleSlug: gameTitleSlug,
        value: true,
      }));
      dispatch(setPlanPresetsError({
        gameTitleSlug: gameTitleSlug,
        value: true,
      }));
    });
  }, [authService, dispatch, gameTitleSlug]);

  useEffect(() => {
    if (!gachaRequestForm.planPresetsLoaded) {
      loadPlanPresets();
    }
  }, [gachaRequestForm.planPresetsLoaded, loadPlanPresets]);

  return (
    <FormTemplate title={t('plan')}>
      <ValidationErrorAlerts validationErrors={validationErrors} pageFilter="plan" />
      {gachaRequestForm.planPresetsError && <WarnAlert onClick={loadPlanPresets}>{t('error.fetch_fail_presets')}</WarnAlert>}
      <Stack spacing={5}>

        <FormControl>
          <FormLabel>{t('presets')}</FormLabel>
          <HelpPopover
            isOpen={showHelp && helpIndexFallback === HelpIndex.PRESETS}
            header={t('help_popover.presets.header')}
            body={t('help_popover.presets.body')}
            onCloseBtnClick={() => dispatch(setShowHelp(false))}
            onPrevBtnClick={() => {
              navigate("../policies");
            }}
            onNextBtnClick={() => {
              dispatch(setPlanHelpIndex(HelpIndex.BUDGET));
            }}
          >
            <Select 
              placeholder={t('presets')}
              onChange={e => {
                const planPreset = gachaRequestForm.planPresets[e.target.value];
                if (planPreset) {
                  dispatch(setPlan({
                    gameTitleSlug: gameTitleSlug,
                    plan: {
                      ...planPreset,
                      wantedItems: planPreset.itemGoals ? 
                        planPreset.wantedItems.filter(wantedItem => gachaRequestForm.customizeItems ? gachaRequestForm.items.some(item => item.id === wantedItem.id) : true) : 
                        [],
                      wantedTiers: planPreset.tierGoals ? 
                        planPreset.wantedTiers
                          .filter(wantedTier => gachaRequestForm.tiers.some(tier => tier.id === wantedTier.id))
                          .filter(wantedTier => gachaRequestForm.customizeItems ? gachaRequestForm.items.some(item => item.tier.id === wantedTier.id) : true) :
                        [],
                    },
                  }))
                }
              }}
              isDisabled={gachaRequestForm.planPresets.length === 0}
            >
              {gachaRequestForm.planPresets.map((plan, i) => (
                <option key={plan.id} value={i}>{plan.name}</option>
              ))}
            </Select>
          </HelpPopover>
        </FormControl>

        <FormControl>
          <FormLabel>{t('budget')}</FormLabel>
          <HelpPopover
            isOpen={showHelp && helpIndexFallback === HelpIndex.BUDGET}
            header={t('help_popover.budget.header')}
            body={t('help_popover.budget.body')}
            onCloseBtnClick={() => dispatch(setShowHelp(false))}
            onPrevBtnClick={() => {
              dispatch(setPlanHelpIndex(HelpIndex.PRESETS));
            }}
            onNextBtnClick={() => {
              dispatch(setPlanHelpIndex(HelpIndex.MAX_CONSECUTIVE_GACHAS));
            }}
          >
            <NumberInput 
              value={gachaRequestForm.plan.budget}
              onChange={(_, value) => dispatch(setBudget({
                gameTitleSlug: gameTitleSlug,
                value: value || 0,
              }))}
              min={0}
              max={10000000}
              allowMouseWheel={true}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HelpPopover>
        </FormControl>

        <FormControl>
          <FormLabel>{t('max_consecutive_gachas')}</FormLabel>
          <HelpPopover
            isOpen={showHelp && helpIndexFallback === HelpIndex.MAX_CONSECUTIVE_GACHAS}
            header={t('help_popover.max_consecutive_gachas.header')}
            body={t('help_popover.max_consecutive_gachas.body')}
            onCloseBtnClick={() => dispatch(setShowHelp(false))}
            onPrevBtnClick={() => {
              dispatch(setPlanHelpIndex(HelpIndex.BUDGET));
            }}
            onNextBtnClick={() => {
              dispatch(setPlanHelpIndex(HelpIndex.ITEM_GOALS));
            }}
          >
            <NumberInput 
              value={gachaRequestForm.plan.maxConsecutiveGachas}
              onChange={(_, value) => dispatch(setMaxConsecutiveGachas({
                gameTitleSlug: gameTitleSlug,
                value: value || 0,
              }))}
              min={0}
              max={1000}
              allowMouseWheel={true}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HelpPopover>
        </FormControl>

        <FormControl as={Flex} alignItems='center'>
          <FormLabel mb='0'>{t('item_goals_q')}</FormLabel>
          <Spacer />
          <HelpPopover
            isOpen={showHelp && helpIndexFallback === HelpIndex.ITEM_GOALS}
            header={t('help_popover.item_goals.header')}
            body={t('help_popover.item_goals.body')}
            onCloseBtnClick={() => dispatch(setShowHelp(false))}
            onPrevBtnClick={() => {
              dispatch(setPlanHelpIndex(HelpIndex.MAX_CONSECUTIVE_GACHAS));
            }}
            onNextBtnClick={() => {
              if (gachaRequestForm.plan.itemGoals) {
                dispatch(setPlanHelpIndex(HelpIndex.ITEM_ADD));
              } else {
                dispatch(setPlanHelpIndex(HelpIndex.TIER_GOALS));
              }
            }}
          >
            <Switch 
              isChecked={gachaRequestForm.plan.itemGoals} 
              onChange={e => dispatch(setItemGoals({
                gameTitleSlug: gameTitleSlug,
                value: e.target.checked,
              }))}
            />
          </HelpPopover>
        </FormControl>

        {gachaRequestForm.plan.itemGoals &&
        <>
          <FormControl as={Flex} alignItems='center'>
            <FormLabel mb='0'>{t('wanted_items')}</FormLabel>
            <Spacer />
            <HelpPopover
              isOpen={showHelp && helpIndexFallback === HelpIndex.ITEM_ADD}
              header={t('help_popover.wanted_items.header')}
              body={t('help_popover.wanted_items.body')}
              onCloseBtnClick={() => dispatch(setShowHelp(false))}
              onPrevBtnClick={() => {
                dispatch(setPlanHelpIndex(HelpIndex.ITEM_GOALS));
              }}
              onNextBtnClick={() => {
                if (filteredWantedItems.length > 0) {
                  dispatch(setPlanHelpIndex(HelpIndex.ITEM_NUMBER));
                } else {
                  dispatch(setPlanHelpIndex(HelpIndex.TIER_GOALS));
                }
              }}
            >
              <Button 
                ref={itemBtnRef} 
                onClick={itemDrawerDisclosure.onOpen}
                isDisabled={gachaRequestForm.customizeItems && gachaRequestForm.items.length === 0}
              >
                {t('add')}
              </Button>
            </HelpPopover>
          </FormControl>

          <SimpleGrid columns={{base: 2, md: 3, lg: 4}} spacing={2}>
          {filteredWantedItems.map((wantedItem, i) => {
            const itemTemplate = <Item 
              {...wantedItem}
              tierName={wantedItem.tier.shortName}
              numberEditable={true}
              numberMin={1}
              numberMax={10000}
              onNumberChange={(_, value) => dispatch(setWantedItemNumber({
                gameTitleSlug: gameTitleSlug,
                index: gachaRequestForm.plan.wantedItems.findIndex((wantedItemToBeFound) => wantedItemToBeFound.id === wantedItem.id),
                value: value || 0,
              }))}
              closable={true}
              onClose={() => dispatch(removeWantedItem({
                gameTitleSlug: gameTitleSlug,
                wantedItem: wantedItem,
              }))}
            />;
            return i === 0 ? 
              <HelpPopover
                isOpen={showHelp && helpIndexFallback === HelpIndex.ITEM_NUMBER}
                header={t('help_popover.item_number.header')}
                body={t('help_popover.item_number.body')}
                onCloseBtnClick={() => dispatch(setShowHelp(false))}
                onPrevBtnClick={() => {
                  dispatch(setPlanHelpIndex(HelpIndex.ITEM_ADD));
                }}
                onNextBtnClick={() => {
                  dispatch(setPlanHelpIndex(HelpIndex.TIER_GOALS));
                }}
                key={wantedItem.id}
              >
                <ScaleFade in={true} initialScale={0.9}>{itemTemplate}</ScaleFade>
              </HelpPopover> 
              : 
              <ScaleFade in={true} initialScale={0.9} key={wantedItem.id}>{itemTemplate}</ScaleFade>;
            })}
          </SimpleGrid>

          <ItemDrawer
            gameTitleSlug={gameTitleSlug}
            drawerTitle={t('select_items')}
            isOpen={itemDrawerDisclosure.isOpen} 
            onClose={itemDrawerDisclosure.onClose}
            fetchItems={!gachaRequestForm.customizeItems} 
            selectMultipleItems={true}
            initialItems={gachaRequestForm.customizeItems ? gachaRequestForm.items : []}
            onAddSelectedItems={selectedWantedItems => {
              const filteredWantedItems = selectedWantedItems
                .filter(selectedWantedItem => gachaRequestForm.plan.wantedItems.every(item => item.id !== selectedWantedItem.id))
                .map(item => ({...item, number: 1}));
              dispatch(addWantedItems({
                gameTitleSlug: gameTitleSlug,
                wantedItems: filteredWantedItems,
              }));
              toast({
                title: t('items_added', { count: filteredWantedItems.length}),
                status: 'success',
                isClosable: true,
              });
            }}
          />
        </>
        }

        <FormControl as={Flex} alignItems='center'>
          <FormLabel mb='0'>{t('tier_goals_q')}</FormLabel>
          <Spacer />
          <HelpPopover
            isOpen={showHelp && helpIndexFallback === HelpIndex.TIER_GOALS}
            header={t('help_popover.tier_goals.header')}
            body={t('help_popover.tier_goals.body')}
            onCloseBtnClick={() => dispatch(setShowHelp(false))}
            onPrevBtnClick={() => {
              if (gachaRequestForm.plan.itemGoals && gachaRequestForm.plan.wantedItems.length > 0) {
                dispatch(setPlanHelpIndex(HelpIndex.ITEM_NUMBER));
              } else if (gachaRequestForm.plan.itemGoals && gachaRequestForm.plan.wantedItems.length === 0) {
                dispatch(setPlanHelpIndex(HelpIndex.ITEM_ADD));
              } else {
                dispatch(setPlanHelpIndex(HelpIndex.ITEM_GOALS));
              }
            }}
            isNextBtnDisabled={!gachaRequestForm.plan.tierGoals}
            onNextBtnClick={() => {
              if (gachaRequestForm.plan.tierGoals) {
                dispatch(setPlanHelpIndex(HelpIndex.TIER_ADD));
              }
            }}
          >
            <Switch 
              isChecked={gachaRequestForm.plan.tierGoals} 
              onChange={e => dispatch(setTierGoals({
                gameTitleSlug: gameTitleSlug,
                value: e.target.checked,
              }))}
            />
          </HelpPopover>
        </FormControl>

        {gachaRequestForm.plan.tierGoals &&
        <>
          <FormControl as={Flex} alignItems='center'>
            <FormLabel mb='0'>{t('wanted_tiers')}</FormLabel>
            <Spacer />
            <HelpPopover
              isOpen={showHelp && helpIndexFallback === HelpIndex.TIER_ADD}
              header={t('help_popover.wanted_tiers.header')}
              body={t('help_popover.wanted_tiers.body')}
              onCloseBtnClick={() => dispatch(setShowHelp(false))}
              onPrevBtnClick={() => {
                dispatch(setPlanHelpIndex(HelpIndex.TIER_GOALS));
              }}
              isNextBtnDisabled={filteredWantedTiers.length === 0}
              onNextBtnClick={() => {
                if (filteredWantedTiers.length > 0) {
                  dispatch(setPlanHelpIndex(HelpIndex.TIER_NUMBER));
                }
              }}
            >
              <Button 
                ref={tierBtnRef} 
                onClick={tierDrawerDisclosure.onOpen}
                isDisabled={gachaRequestForm.customizeItems && gachaRequestForm.items.length === 0}
              >
                {t('add')}
              </Button>
            </HelpPopover>
          </FormControl>

          <SimpleGrid columns={{base: 2, md: 3, lg: 4}} spacing={2}>
          {filteredWantedTiers.map((wantedTier, i) => {
            const tierTemplate = <Tier 
              {...wantedTier}
              numberEditable={true}
              numberMin={1}
              numberMax={10000}
              onNumberChange={(_, value) => dispatch(setWantedTierNumber({
                gameTitleSlug: gameTitleSlug,
                index: gachaRequestForm.plan.wantedTiers.findIndex((wantedTierToBeFound) => wantedTierToBeFound.id === wantedTier.id),
                value: value || 0,
              }))}
              closable={true}
              onClose={() => dispatch(removeWantedTier({
                gameTitleSlug: gameTitleSlug,
                wantedTier: wantedTier,
              }))}
            />;
            return i === 0 ? 
              <HelpPopover
                isOpen={showHelp && helpIndexFallback === HelpIndex.TIER_NUMBER}
                header={t('help_popover.tier_number.header')}
                body={t('help_popover.tier_number.body')}
                onCloseBtnClick={() => dispatch(setShowHelp(false))}
                onPrevBtnClick={() => {
                  dispatch(setPlanHelpIndex(HelpIndex.TIER_ADD));
                }}
                isNextBtnDisabled={true}
                key={wantedTier.id}
              >
                <ScaleFade in={true} initialScale={0.9}>{tierTemplate}</ScaleFade>
              </HelpPopover>
              :
              <ScaleFade in={true} initialScale={0.9} key={wantedTier.id}>{tierTemplate}</ScaleFade>;
          })}
          </SimpleGrid>

          <TierDrawer
            onClose={tierDrawerDisclosure.onClose} 
            isOpen={tierDrawerDisclosure.isOpen} 
            tiers={gachaRequestForm.tiers.filter(tier => gachaRequestForm.customizeItems ? gachaRequestForm.items.some(item => item.tier.id === tier.id) : true)}
            onAddSelectedTiers={selectedWantedTiers => {
              const filteredWantedTiers = selectedWantedTiers
                .filter(selectedWantedTier => gachaRequestForm.plan.wantedTiers.every(tier => tier.id !== selectedWantedTier.id))
                .map(tier => ({...tier, number: 1}))
              dispatch(addWantedTiers({
                gameTitleSlug: gameTitleSlug,
                wantedTiers: filteredWantedTiers,
              }));
              toast({
                title: t('tiers_added', { count: filteredWantedTiers.length}),
                status: 'success',
                isClosable: true,
              });
            }}
          />
        </>
        }

      </Stack>
      <NavigationButtons prevBtnLink="../policies" nextBtnLink="../review" />
    </FormTemplate>
  );
}