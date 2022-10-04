import { 
  Center,
  Heading,
  SimpleGrid,
  Spinner, 
  Stack, 
  Text, 
  useToast,
} from '@chakra-ui/react'
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  setPresetsLoaded, 
  setPresets, 
  setPresetsError, 
  setPricing, 
  setPolicies, 
  setPlan, 
  setTiers, 
  setTiersLoaded, 
  setCustomizeItems, 
  setItems 
} from '../utils/gachaRequestFormSlice';
import { useGachaRequestForm } from '../utils/gachaHooks';
import { useAuth } from "../auth/AuthContext";
import { useCallback, useEffect, useRef } from 'react';
import { FormTemplateWrapper } from './FormTemplate';
import ReloadButton from './ReloadButton';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

const Preset = ({preset, ...rest}) => {
  const { name, description } = preset;
  return (
    <Stack
      as='button'
      borderWidth='1px' 
      borderRadius='lg' 
      boxShadow='lg'
      p={3}
      {...rest}
    >
      <Heading size='md'>{name}</Heading>
      <Text noOfLines={3}>{description}</Text>
    </Stack>
  )
};

export default function PresetsForm() {
  const { authService } = useAuth();
  const { gameTitleSlug } = useParams();
  const { gachaRequestForm } = useGachaRequestForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const scrollRef = useRef();
  const { t } = useTranslation();

  const loadPresets = useCallback(() => {
    dispatch(setPresetsLoaded({
      gameTitleSlug: gameTitleSlug,
      value: false,
    }));
    fetch(`/api/game-titles/${gameTitleSlug}/presets`, {
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
    .then(presetsResponse => {
      dispatch(setPresets({
        gameTitleSlug: gameTitleSlug,
        presets: presetsResponse.presets,
      }));
      dispatch(setPresetsLoaded({
        gameTitleSlug: gameTitleSlug,
        value: true,
      }));
      dispatch(setPresetsError({
        gameTitleSlug: gameTitleSlug,
        value: false,
      }));
      dispatch(setTiers({
        gameTitleSlug: gameTitleSlug,
        tiers: presetsResponse.tiers,
      }));
      dispatch(setTiersLoaded({
        gameTitleSlug: gameTitleSlug,
        value: true,
      }));
    })
    .catch(() => {
      dispatch(setPresetsLoaded({
        gameTitleSlug: gameTitleSlug,
        value: true,
      }));
      dispatch(setPresetsError({
        gameTitleSlug: gameTitleSlug,
        value: true,
      }));
      toast({
        title: t('error.fetch_fail_form_presets'),
        status: 'error',
        isClosable: true,
      });
    });
  }, [authService, dispatch, gameTitleSlug, t, toast]);

  const handlePresetClick = ({pricing, policies, plan}) => {
    dispatch(setCustomizeItems({
      gameTitleSlug: gameTitleSlug,
      value: false,
    }));
    dispatch(setItems({
      gameTitleSlug: gameTitleSlug,
      items: [],
    }));
    dispatch(setPricing({
      gameTitleSlug: gameTitleSlug,
      pricing: {
        pricePerGacha: (pricing && pricing.pricePerGacha) || 0,
        discount: (pricing && pricing.discount) || false,
        discountTrigger: (pricing && pricing.discountTrigger) || 1,
        discountedPricePerGacha: (pricing && pricing.discountedPricePerGacha) || 0,
      },
    }));
    dispatch(setPolicies({
      gameTitleSlug: gameTitleSlug,
      policies: {
        pity: (policies && policies.pity) || false,
        pityItem: (policies && policies.pityItem) || undefined,
        pityTrigger: (policies && policies.pityTrigger) || 0,
      },
    }));
    dispatch(setPlan({
      gameTitleSlug: gameTitleSlug,
      plan: {
        budget: (plan && plan.budget) || 0,
        maxConsecutiveGachas: (plan && plan.maxConsecutiveGachas) || 0,
        itemGoals: (plan && plan.itemGoals) || false,
        wantedItems: (plan && plan.wantedItems) || [],
        tierGoals: (plan && plan.tierGoals) || false,
        wantedTiers: (plan && plan.wantedTiers) || [],
      },
    }));
    navigate('../review');
  };

  useEffect(() => {
    if (!gachaRequestForm.presetsLoaded) {
      loadPresets();
    }
  }, [gachaRequestForm.presetsLoaded, loadPresets]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, []);

  if (!gachaRequestForm.presetsLoaded) {
    return <FormTemplateWrapper title={t('presets')} ref={scrollRef}>
      <Center><Spinner /></Center>
    </FormTemplateWrapper>;
  }

  if (gachaRequestForm.presetsError) {
    return <FormTemplateWrapper title={t('presets')} ref={scrollRef}>
      <Center><ReloadButton onClick={loadPresets} /></Center>
    </FormTemplateWrapper>;
  }

  return (
    <FormTemplateWrapper title={t('presets')} ref={scrollRef}>
      <SimpleGrid columns={{base: 1, md: 2, lg: 2}} spacing={10}>
      {gachaRequestForm.presets.map((preset) => (
        <Preset preset={preset} onClick={() => handlePresetClick(preset)} key={preset.id} />
      ))}
      <Preset
        preset={{
          name: t('advanced_settings'),
          description: t('advanced_settings_description'),
        }}
        onClick={() => navigate('../tiers')}
      />
      </SimpleGrid>
    </FormTemplateWrapper>
  );
}