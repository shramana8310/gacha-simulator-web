import { 
  Center,
  Flex,
  Grid,
  GridItem,
  SimpleGrid, 
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Spinner, 
  Stack,
  Stat, 
  StatHelpText, 
  StatLabel, 
  StatNumber, 
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Divider, 
} from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { setShowHelp, setTierRatio, setTiers, setTiersLoaded, setTiersError } from '../utils/gachaRequestFormSlice';
import { useGachaRequestForm } from '../utils/gachaHooks';
import HelpPopover from './HelpPopover';
import ValidationErrorAlerts from './ValidationErrorAlerts';
import NavigationButtons from './NavigationButtons';
import { useAuth } from "../auth/AuthContext";
import { useCallback, useEffect, useRef } from 'react';
import { FormTemplateWrapper } from './FormTemplate';
import ReloadButton from './ReloadButton';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

const HelpIndex = {
  TIER_RATIO: 0,
};

export default function TierForm() {
  const { authService } = useAuth();
  const { gameTitleSlug } = useParams();
  const { gachaRequestForm, validationErrors, tierEntries } = useGachaRequestForm();
  const { showHelp, tiersHelpIndex } = useSelector((state) => state.gachaRequestForm);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const scrollRef = useRef();
  const { t } = useTranslation();

  const loadTiers = useCallback(() => {
    dispatch(setTiersLoaded({
      gameTitleSlug: gameTitleSlug,
      value: false,
    }));
    fetch(`/api/game-titles/${gameTitleSlug}/tiers`, {
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
    .then(tiers => {
      dispatch(setTiers({
        gameTitleSlug: gameTitleSlug,
        tiers: tiers,
      }));
      dispatch(setTiersLoaded({
        gameTitleSlug: gameTitleSlug,
        value: true,
      }));
      dispatch(setTiersError({
        gameTitleSlug: gameTitleSlug,
        value: false,
      }));
    })
    .catch(() => {
      dispatch(setTiersLoaded({
        gameTitleSlug: gameTitleSlug,
        value: true,
      }));
      dispatch(setTiersError({
        gameTitleSlug: gameTitleSlug,
        value: true,
      }));
      toast({
        title: t('error.fetch_fail_tier'),
        status: 'error',
        isClosable: true,
      });
    });
  }, [authService, dispatch, gameTitleSlug, t, toast]);

  useEffect(() => {
    if (!gachaRequestForm.tiersLoaded) {
      loadTiers();
    }
  }, [gachaRequestForm.tiersLoaded, loadTiers]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, []);

  if (!gachaRequestForm.tiersLoaded) {
    return <FormTemplateWrapper title={t('tiers')} showHelpIcon={true} ref={scrollRef}>
      <Center><Spinner /></Center>
    </FormTemplateWrapper>;
  }

  if (gachaRequestForm.tiersError) {
    return <FormTemplateWrapper title={t('tiers')} showHelpIcon={true} ref={scrollRef}>
      <Center><ReloadButton onClick={loadTiers} /></Center>
    </FormTemplateWrapper>;
  }

  return (
    <FormTemplateWrapper title={t('tiers')} showHelpIcon={true} ref={scrollRef}>
      <ValidationErrorAlerts validationErrors={validationErrors} pageFilter="tiers" />
      <Stack spacing={5}>
        {gachaRequestForm.tiers.map((tier, i) => {
          const NumberInputTemplate = <NumberInput size='sm' value={tier.ratio} min={0} max={1000} onChange={(value) => {
            dispatch(setTierRatio({
              gameTitleSlug: gameTitleSlug,
              index: i,
              value: parseInt(value) || 0,
            }))
          }}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>;
          return <Grid templateColumns='repeat(9,1fr)' key={i} gap={5}>
            <GridItem colSpan={{base: 1, md: 1}} display='grid'>
              <Flex align='center'>
                <Center>
                  <Text>{tier.shortName}</Text>
                </Center>
              </Flex>
            </GridItem>
            <GridItem colSpan={{base: 5, md: 6}}  display='grid'>
              <Flex align='center'>
                <Slider 
                  value={tier.ratio}
                  focusThumbOnChange={false} 
                  min={0} 
                  max={1000} 
                  onChange={(value) => {
                    dispatch(setTierRatio({
                      gameTitleSlug: gameTitleSlug,
                      index: i,
                      value: value || 0,
                    }))
                  }}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </Flex>
            </GridItem>
            <GridItem colSpan={{base: 3, md: 2}} display='grid'>
              <Flex align='center'>
                {i === 0 ? <HelpPopover
                  isOpen={showHelp && tiersHelpIndex === HelpIndex.TIER_RATIO}
                  header={t('help_popover.tier_ratio.header')}
                  body={t('help_popover.tier_ratio.body')}
                  onCloseBtnClick={() => dispatch(setShowHelp(false))}
                  isPrevBtnDisabled={true}
                  onNextBtnClick={() => {
                    navigate("../items");
                  }}
                  key={tier.id}
                >{NumberInputTemplate}</HelpPopover> : NumberInputTemplate}
              </Flex>
            </GridItem>
          </Grid>;
        })}
        <SimpleGrid columns={{base: 2, md: 3, lg: 4}} spacing={2}>
          {tierEntries.map(tierEntry => 
            <Stat key={tierEntry.tier.id}>
              <StatLabel>{tierEntry.tier.name}</StatLabel>
              <StatNumber>{t('formatted_percentage', {val: tierEntry.percentage})}</StatNumber>
              <StatHelpText>{t('formatted_integer', {integer: tierEntry.tier.ratio})} / {t('formatted_integer', {integer: tierEntry.tierRatioSum})}</StatHelpText>
            </Stat>)}
        </SimpleGrid>
      </Stack>
      <Divider />
      <NavigationButtons prevBtnDisabled nextBtnLink="../items" />
    </FormTemplateWrapper>
  );
}