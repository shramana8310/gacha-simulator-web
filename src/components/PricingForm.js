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
  Text,
  Divider,
} from '@chakra-ui/react'
import i18next from 'i18next';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oauth2-pkce';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  setDiscount, 
  setDiscountedPricePerGacha, 
  setDiscountTrigger, 
  setPricePerGacha, 
  setPricing,
  setPricingHelpIndex,
  setPricingPresets,
  setPricingPresetsError,
  setPricingPresetsLoaded,
  setShowHelp,
} from '../utils/gachaRequestFormSlice';
import { useGachaRequestForm } from '../utils/gachaHooks';
import { FormTemplateWrapper } from './FormTemplate';
import HelpPopover from './HelpPopover';
import NavigationButtons from './NavigationButtons';
import ValidationErrorAlerts from './ValidationErrorAlerts';
import WarnAlert from './WarnAlert';

const HelpIndex = {
  PRESETS: 0,
  PRICE_PER_GACHA: 1,
  DISCOUNT: 2,
  DISCOUNT_TRIGGER: 3,
  DISCOUNTED_PRICE_PER_GACHA: 4,
};

export default function PricingForm() {
  const { authService } = useAuth();
  const { gameTitleSlug } = useParams();
  const { gachaRequestForm, validationErrors } = useGachaRequestForm();
  const { showHelp, pricingHelpIndex } = useSelector((state) => state.gachaRequestForm);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const helpIndexFallback = useMemo(() => {
    if ((pricingHelpIndex === HelpIndex.DISCOUNTED_PRICE_PER_GACHA || pricingHelpIndex === HelpIndex.DISCOUNT_TRIGGER) && !gachaRequestForm.pricing.discount) {
      return HelpIndex.DISCOUNT;
    } else {
      return pricingHelpIndex;
    }  
  }, [pricingHelpIndex, gachaRequestForm]);
  const scrollRef = useRef();
  const { t } = useTranslation();

  const loadPricingPresets = useCallback(() => {
    dispatch(setPricingPresetsLoaded({
      gameTitleSlug: gameTitleSlug,
      value: false,
    }));
    fetch(`/api/game-titles/${gameTitleSlug}/pricings`, {
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
    .then(pricingPresets => {
      dispatch(setPricingPresets({
        gameTitleSlug: gameTitleSlug,
        pricingPresets: pricingPresets,
      }));
      dispatch(setPricingPresetsLoaded({
        gameTitleSlug: gameTitleSlug,
        value: true,
      }));
      dispatch(setPricingPresetsError({
        gameTitleSlug: gameTitleSlug,
        value: false,
      }));
    })
    .catch(() => {
      dispatch(setPricingPresetsLoaded({
        gameTitleSlug: gameTitleSlug,
        value: true,
      }));
      dispatch(setPricingPresetsError({
        gameTitleSlug: gameTitleSlug,
        value: true,
      }));
    });
  }, [authService, dispatch, gameTitleSlug]);

  useEffect(() => {
    if (!gachaRequestForm.pricingPresetsLoaded) {
      loadPricingPresets();
    }
  }, [gachaRequestForm.pricingPresetsLoaded, loadPricingPresets]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, []);

  return (
    <FormTemplateWrapper title={t('pricing')} showHelpIcon={true} ref={scrollRef}>
      <ValidationErrorAlerts validationErrors={validationErrors} pageFilter="pricing" />
      {gachaRequestForm.pricingPresetsError && <WarnAlert onClick={loadPricingPresets}>{t('error.fetch_fail_presets')}</WarnAlert>}
      <Stack spacing={5}>
        <FormControl>
          <FormLabel>{t('presets')}</FormLabel>
          <HelpPopover
            isOpen={showHelp && helpIndexFallback === HelpIndex.PRESETS}
            header={t('help_popover.presets.header')}
            body={t('help_popover.presets.body')}
            onCloseBtnClick={() => dispatch(setShowHelp(false))}
            onPrevBtnClick={() => {
              navigate("../items");
            }}
            onNextBtnClick={() => {
              dispatch(setPricingHelpIndex(HelpIndex.PRICE_PER_GACHA));
            }}
          >
            <Select 
              placeholder={t('presets')}
              onChange={e => {
                const pricingPreset = gachaRequestForm.pricingPresets[e.target.value];
                if (pricingPreset) {
                  dispatch(setPricing({
                    gameTitleSlug: gameTitleSlug,
                    pricing: pricingPreset,
                  }));
                }
              }}
              isDisabled={gachaRequestForm.pricingPresets.length === 0}
            >
              {gachaRequestForm.pricingPresets.map((pricing, i) => (
                <option key={pricing.id} value={i}>{pricing.name}</option>
              ))}
            </Select>
          </HelpPopover>
        </FormControl>

        <FormControl>
          <FormLabel>{t('price_per_gacha')}</FormLabel>
          <HelpPopover
            isOpen={showHelp && helpIndexFallback === HelpIndex.PRICE_PER_GACHA}
            header={t('help_popover.price_per_gacha.header')}
            body={t('help_popover.price_per_gacha.body')}
            onCloseBtnClick={() => dispatch(setShowHelp(false))}
            onPrevBtnClick={() => {
              dispatch(setPricingHelpIndex(HelpIndex.PRESETS));
            }}
            onNextBtnClick={() => {
              dispatch(setPricingHelpIndex(HelpIndex.DISCOUNT));
            }}
          >
            <NumberInput 
              value={gachaRequestForm.pricing.pricePerGacha}
              onChange={(_, value) => dispatch(setPricePerGacha({
                gameTitleSlug: gameTitleSlug,
                value: value || 0,
              }))}
              min={0}
              max={100000}
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
          <FormLabel mb='0'>{t('discount_q')}</FormLabel>
          <Spacer />
          <HelpPopover
            isOpen={showHelp && helpIndexFallback === HelpIndex.DISCOUNT}
            header={t('help_popover.discount.header')}
            body={t('help_popover.discount.body')}
            onCloseBtnClick={() => dispatch(setShowHelp(false))}
            onPrevBtnClick={() => {
              dispatch(setPricingHelpIndex(HelpIndex.PRICE_PER_GACHA));
            }}
            onNextBtnClick={() => {
              if (gachaRequestForm.pricing.discount) {
                dispatch(setPricingHelpIndex(HelpIndex.DISCOUNT_TRIGGER));
              } else {
                navigate("../policies");
              }
            }}
          >
            <Switch 
              isChecked={gachaRequestForm.pricing.discount} 
              onChange={e => dispatch(setDiscount({
                gameTitleSlug: gameTitleSlug,
                value: e.target.checked,
              }))}
            />
          </HelpPopover>
        </FormControl>

        {gachaRequestForm.pricing.discount &&
        <>
          <FormControl>
            <FormLabel>{t('discount_trigger')}</FormLabel>
            <HelpPopover
              isOpen={showHelp && helpIndexFallback === HelpIndex.DISCOUNT_TRIGGER}
              header={t('help_popover.discount_trigger.header')}
              body={t('help_popover.discount_trigger.body')}
              onCloseBtnClick={() => dispatch(setShowHelp(false))}
              onPrevBtnClick={() => {
                dispatch(setPricingHelpIndex(HelpIndex.DISCOUNT));
              }}
              onNextBtnClick={() => {
                dispatch(setPricingHelpIndex(HelpIndex.DISCOUNTED_PRICE_PER_GACHA));
              }}
            >
              <NumberInput 
                value={gachaRequestForm.pricing.discountTrigger}
                onChange={(_, value) => dispatch(setDiscountTrigger({
                  gameTitleSlug: gameTitleSlug,
                  value: value || 1,
                }))}
                min={1}
                max={10000}
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
            <FormLabel>{t('discount_price_per_gacha')}</FormLabel>
            <HelpPopover
              isOpen={showHelp && helpIndexFallback === HelpIndex.DISCOUNTED_PRICE_PER_GACHA}
              header={t('help_popover.discount_price_per_gacha.header')}
              body={t('help_popover.discount_price_per_gacha.body')}
              onCloseBtnClick={() => dispatch(setShowHelp(false))}
              onPrevBtnClick={() => {
                dispatch(setPricingHelpIndex(HelpIndex.DISCOUNT_TRIGGER));
              }}
              onNextBtnClick={() => {
                navigate("../policies");
              }}
            >
              <NumberInput 
                value={gachaRequestForm.pricing.discountedPricePerGacha}
                onChange={(_, value) => dispatch(setDiscountedPricePerGacha({
                  gameTitleSlug: gameTitleSlug,
                  value: value || 0,
                }))}
                min={0}
                max={gachaRequestForm.pricing.pricePerGacha}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </HelpPopover>
          </FormControl>

          <Text>{t('discount_price_per_n_gachas_w_val', {
            count: gachaRequestForm.pricing.discountTrigger,
            price: gachaRequestForm.pricing.discountedPricePerGacha * gachaRequestForm.pricing.discountTrigger
          })}</Text>
        </>
        }
      </Stack>
      <Divider />
      <NavigationButtons prevBtnLink="../items" nextBtnLink="../policies" />
    </FormTemplateWrapper>
  );
}