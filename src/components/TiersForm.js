import { 
  Center,
  ScaleFade, 
  SimpleGrid, 
  Spinner, 
  useToast, 
} from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { setShowHelp, setTierRatio, setTiers, setTiersLoaded, setTiersError } from '../redux/gachaRequestFormSlice';
import Tier from "./Tier";
import useGachaRequestForm from '../redux/useGachaRequestForm';
import HelpPopover from './HelpPopover';
import ValidationErrorAlerts from './ValidationErrorAlerts';
import NavigationButtons from './NavigationButtons';
import { useAuth } from 'react-oauth2-pkce';
import { useCallback, useEffect } from 'react';
import FormTemplate from './FormTemplate';
import ReloadButton from './ReloadButton';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

const HelpIndex = {
  TIER_RATIO: 0,
};

export default function TierForm() {
  const { authService } = useAuth();
  const { gameTitleSlug } = useParams();
  const { gachaRequestForm, validationErrors } = useGachaRequestForm();
  const { showHelp, tiersHelpIndex } = useSelector((state) => state.gachaRequestForm);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const loadTiers = useCallback(() => {
    dispatch(setTiersLoaded({
      gameTitleSlug: gameTitleSlug,
      value: false,
    }));
    fetch(`/api/game-titles/${gameTitleSlug}/tiers`, {
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

  if (!gachaRequestForm.tiersLoaded) {
    return <FormTemplate title={t('tiers')}>
      <Center><Spinner /></Center>
    </FormTemplate>;
  }

  if (gachaRequestForm.tiersError) {
    return <FormTemplate title={t('tiers')}>
      <Center><ReloadButton onClick={loadTiers} /></Center>
    </FormTemplate>;
  }

  return (
    <FormTemplate title={t('tiers')}>
      <ValidationErrorAlerts validationErrors={validationErrors} pageFilter="tiers" />
      <SimpleGrid columns={{base: 2, md: 3, lg: 4}} spacing={2}>
        {gachaRequestForm.tiers && gachaRequestForm.tiers.map((tier, i) => {
          const tierTemplate = <Tier
            {...tier}
            ratioEditable={true}
            ratioMin={0}
            ratioMax={10000}
            onRatioChange={(_, value) => dispatch(setTierRatio({
              gameTitleSlug: gameTitleSlug,
              index: i,
              value: value || 0,
            }))}
          />;
          return i === 0 ? 
            <HelpPopover
              isOpen={showHelp && tiersHelpIndex === HelpIndex.TIER_RATIO}
              header={t('help_popover.tier_ratio.header')}
              body={t('help_popover.tier_ratio.body')}
              onCloseBtnClick={() => dispatch(setShowHelp(false))}
              isPrevBtnDisabled={true}
              onNextBtnClick={() => {
                navigate("../items");
              }}
              key={tier.id}
            >
              <ScaleFade in={true} initialScale={0.9}>
                {tierTemplate}
              </ScaleFade>
            </HelpPopover>
            :
            <ScaleFade in={true} initialScale={0.9} key={tier.id}>{tierTemplate}</ScaleFade>;
        })}
      </SimpleGrid>
      <NavigationButtons prevBtnDisabled={true} nextBtnLink="../items" />
    </FormTemplate>
  );
}