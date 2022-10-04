import { 
  Box, 
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
  Center,
  useDisclosure,
  ScaleFade,
  Text,
  Divider,
} from '@chakra-ui/react'
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { setPity, setPityItem, setPityTrigger, setPolicies, setPoliciesHelpIndex, setPoliciesPresets, setPoliciesPresetsError, setPoliciesPresetsLoaded, setShowHelp } from '../utils/gachaRequestFormSlice';
import Item from './Item';
import { useGachaRequestForm } from '../utils/gachaHooks';
import ItemDrawer from './ItemDrawer';
import HelpPopover from './HelpPopover';
import ValidationErrorAlerts from './ValidationErrorAlerts';
import NavigationButtons from './NavigationButtons';
import { useAuth } from "../auth/AuthContext";
import { FormTemplateWrapper } from './FormTemplate';
import WarnAlert from './WarnAlert';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

const HelpIndex = {
  PRESETS: 0,
  PITY: 1,
  PITY_TRIGGER: 2,
  PITY_ITEM: 3,
};

export default function PoliciesForm() {
  const { authService } = useAuth();
  const { gameTitleSlug } = useParams();
  const { gachaRequestForm, validationErrors } = useGachaRequestForm();
  const { showHelp, policiesHelpIndex } = useSelector((state) => state.gachaRequestForm);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pityItem = useMemo(() => {
    if (gachaRequestForm.policies.pity) {
      if (gachaRequestForm.customizeItems) {
        return gachaRequestForm.items.find(item => gachaRequestForm.policies.pityItem && item.id === gachaRequestForm.policies.pityItem.id);
      } else {
        return gachaRequestForm.policies.pityItem;
      }
    }  
  }, [gachaRequestForm]);
  const helpIndexFallback = useMemo(() => {
    if ((policiesHelpIndex === HelpIndex.PITY_ITEM || policiesHelpIndex === HelpIndex.PITY_TRIGGER) && !gachaRequestForm.policies.pity) {
      return HelpIndex.PITY;
    } else {
      return policiesHelpIndex;
    }  
  }, [policiesHelpIndex, gachaRequestForm]);
  const scrollRef = useRef();
  const { t } = useTranslation();

  const loadPoliciesPresets = useCallback(() => {
    dispatch(setPoliciesPresetsLoaded({
      gameTitleSlug: gameTitleSlug,
      value: false,
    }));
    fetch(`/api/game-titles/${gameTitleSlug}/policies`, {
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
    .then(policiesPresets => {
      dispatch(setPoliciesPresets({
        gameTitleSlug: gameTitleSlug,
        policiesPresets: policiesPresets,
      }));
      dispatch(setPoliciesPresetsLoaded({
        gameTitleSlug: gameTitleSlug,
        value: true,
      }));
      dispatch(setPoliciesPresetsError({
        gameTitleSlug: gameTitleSlug,
        value: false,
      }));
    })
    .catch(() => {
      dispatch(setPoliciesPresetsLoaded({
        gameTitleSlug: gameTitleSlug,
        value: true,
      }));
      dispatch(setPoliciesPresetsError({
        gameTitleSlug: gameTitleSlug,
        value: true,
      }));
    });
  }, [authService, dispatch, gameTitleSlug]);

  useEffect(() => {
    if (!gachaRequestForm.policiesPresetsLoaded) {
      loadPoliciesPresets();
    }
  }, [gachaRequestForm.policiesPresetsLoaded, loadPoliciesPresets]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, []);

  return (
    <FormTemplateWrapper title={t('policies')} showHelpIcon={true} ref={scrollRef}>
      <ValidationErrorAlerts validationErrors={validationErrors} pageFilter="policies" />
      {gachaRequestForm.policiesPresetsError && <WarnAlert onClick={loadPoliciesPresets}>{t('error.fetch_fail_presets')}</WarnAlert>}
      <Stack spacing={5}>

        <FormControl>
          <FormLabel>{t('presets')}</FormLabel>
          <HelpPopover
            isOpen={showHelp && helpIndexFallback === HelpIndex.PRESETS}
            header={t('help_popover.presets.header')}
            body={t('help_popover.presets.body')}
            onCloseBtnClick={() => dispatch(setShowHelp(false))}
            onPrevBtnClick={() => {
              navigate("../pricing");
            }}
            onNextBtnClick={() => {
              dispatch(setPoliciesHelpIndex(HelpIndex.PITY));
            }}
          >
            <Select 
              placeholder={t('presets')}
              onChange={e => {
                const policiesPreset = gachaRequestForm.policiesPresets[e.target.value];
                if (policiesPreset) {
                  dispatch(setPolicies({
                    gameTitleSlug: gameTitleSlug,
                    policies: policiesPreset,
                  }));
                }
              }}
              isDisabled={gachaRequestForm.policiesPresets.length === 0}
            >
              {gachaRequestForm.policiesPresets.map((policies, i) => (
                <option key={policies.id} value={i}>{policies.name}</option>
              ))}
            </Select>
          </HelpPopover>
        </FormControl>

        <FormControl as={Flex} alignItems='center'>
          <FormLabel mb='0'>{t('pity_q')}</FormLabel>
          <Spacer />
          <HelpPopover
            isOpen={showHelp && helpIndexFallback === HelpIndex.PITY}
            header={t('help_popover.pity.header')}
            body={t('help_popover.pity.body')}
            onCloseBtnClick={() => dispatch(setShowHelp(false))}
            onPrevBtnClick={() => {
              dispatch(setPoliciesHelpIndex(HelpIndex.PRESETS));
            }}
            onNextBtnClick={() => {
              if (gachaRequestForm.policies.pity) {
                dispatch(setPoliciesHelpIndex(HelpIndex.PITY_TRIGGER));
              } else {
                navigate("../plan");
              }
            }}
          >
            <Switch 
              isChecked={gachaRequestForm.policies.pity} 
              onChange={e => dispatch(setPity({
                gameTitleSlug: gameTitleSlug,
                value: e.target.checked,
              }))}
            />
          </HelpPopover>
        </FormControl>

        {gachaRequestForm.policies.pity &&
        <>
          <FormControl>
            <FormLabel>{t('pity_trigger')}</FormLabel>
            <HelpPopover
              isOpen={showHelp && helpIndexFallback === HelpIndex.PITY_TRIGGER}
              header={t('help_popover.pity_trigger.header')}
              body={t('help_popover.pity_trigger.body')}
              onCloseBtnClick={() => dispatch(setShowHelp(false))}
              onPrevBtnClick={() => {
                dispatch(setPoliciesHelpIndex(HelpIndex.PITY));
              }}
              onNextBtnClick={() => {
                dispatch(setPoliciesHelpIndex(HelpIndex.PITY_ITEM));
              }}
            >
              <NumberInput 
                value={gachaRequestForm.policies.pityTrigger}
                onChange={(_, value) => dispatch(setPityTrigger({
                  gameTitleSlug: gameTitleSlug,
                  value: value || 0,
                }))}
                min={0}
                max={1000}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </HelpPopover>
          </FormControl>

          <FormControl as={Stack} spacing={5}>
            <Flex alignItems='center'>
              <FormLabel mb='0'>{t('pity_item')}</FormLabel>
              <Spacer />
              <HelpPopover
                isOpen={showHelp && helpIndexFallback === HelpIndex.PITY_ITEM}
                header={t('help_popover.pity_item.header')}
                body={t('help_popover.pity_item.body')}
                onCloseBtnClick={() => dispatch(setShowHelp(false))}
                onPrevBtnClick={() => {
                  dispatch(setPoliciesHelpIndex(HelpIndex.PITY_TRIGGER));
                }}
                onNextBtnClick={() => {
                  navigate("../plan");
                }}
              >
                <Button 
                  ref={btnRef} 
                  onClick={onOpen}
                  isDisabled={gachaRequestForm.customizeItems && gachaRequestForm.items.length === 0}
                >
                  {t('select')}
                </Button>
              </HelpPopover>
            </Flex>
            {gachaRequestForm.policies.pity && pityItem &&
              <Center>
                <Box w='xs'>
                  <ScaleFade in={true} initialScale={0.9}>
                    <Item 
                      {...pityItem} 
                      tierName={pityItem.tier.shortName}>
                      <Text>{pityItem.name}</Text>
                    </Item>
                  </ScaleFade>
                </Box>
              </Center>}
          </FormControl>

          <ItemDrawer
            gameTitleSlug={gameTitleSlug}
            drawerTitle={t('select_item')}
            isOpen={isOpen} 
            onClose={onClose} 
            fetchItems={!gachaRequestForm.customizeItems}
            initialItems={gachaRequestForm.customizeItems ? gachaRequestForm.items : []}
            onItemSelect={(pityItem) => dispatch(setPityItem({
              gameTitleSlug: gameTitleSlug,
              pityItem: pityItem,
            }))}
          />

        </>
        }

      </Stack>
      <Divider />
      <NavigationButtons prevBtnLink="../pricing" nextBtnLink="../plan" />
    </FormTemplateWrapper>
  );
}