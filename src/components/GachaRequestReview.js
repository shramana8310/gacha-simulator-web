import { 
  Box, 
  SimpleGrid, 
  ListItem,
  UnorderedList,
  Stack,
  Button,
  useDisclosure,
  Flex,
  Spacer,
} from '@chakra-ui/react'
import { ResponsiveSunburst } from '@nivo/sunburst'
import i18next from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oauth2-pkce';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import useGachaRequestForm from '../redux/useGachaRequestForm';
import FormTemplate from './FormTemplate';
import GachaResultModal from './GachaResultModal';
import ValidationErrorAlerts from './ValidationErrorAlerts';

export default function GachaRequestReview() {
  const { authService } = useAuth();
  const { gameTitleCache } = useSelector((state) => state.gameTitle);
  const { gameTitleSlug } = useParams();
  const navigate = useNavigate();
  const { 
    gachaRequestForm, 
    validationErrors, 
    countWithinBudget, 
    effectiveMaxConsecutiveGachas,
  } = useGachaRequestForm();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [gachaResult, setGachaResult] = useState();
  const [gachaExecuting, setGachaExecuting] = useState(false);
  const [error, setError] = useState(false);
  const { t } = useTranslation();
  
  const gameTitle = gameTitleCache[gameTitleSlug];
  const executeGacha = () => {
    setGachaExecuting(true);
    fetch(`/api/gachas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getAuthTokens().access_token}`,
        'Accept-Language': i18next.language,
      },
      body: JSON.stringify({
        gameTitle: gameTitle,
        tiers: gachaRequestForm.tiers
          .map(tier => ({
            ...tier,
            items: gachaRequestForm.customizeItems ? gachaRequestForm.items
              .filter(item => item.tier.id === tier.id)
              .map(item => ({
                id: item.id,
                ratio: item.ratio,
              })) : [],
          }))
          .filter(tier => gachaRequestForm.customizeItems ? tier.items.length > 0 : true),
        itemsIncluded: gachaRequestForm.customizeItems,
        pricing: gachaRequestForm.pricing,
        policies: gachaRequestForm.policies,
        plan: gachaRequestForm.plan,
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error();
      }
      return response.json();
    })
    .then(gachaResult => {
      setGachaResult(gachaResult);
      setGachaExecuting(false);
      setError(false);
    })
    .catch(() => {
      setGachaExecuting(false);
      setError(true);
    });
  };

  return <>
    <FormTemplate title={t('review')}>
      <ValidationErrorAlerts validationErrors={validationErrors} link={true} />
      {validationErrors.length === 0 && 
      <SimpleGrid columns={{base: 1, md: 2}} spacing={2}>
        <Box height='400px'>
          <ResponsiveSunburst
            data={{
              id: 'tierItemSunburstChart',
              value: 0,
              children: gachaRequestForm.tiers.map(tier => ({
                ...tier,
                id: tier.shortName,
                value: gachaRequestForm.customizeItems ? undefined : tier.ratio,
                children: gachaRequestForm.customizeItems ? gachaRequestForm.items
                  .filter(item => item.tier.id === tier.id)
                  .map((item, _, filteredItems) => ({
                    ...item,
                    id: item.shortName,
                    value: (item.ratio / filteredItems.reduce((prev, item) => prev + item.ratio, 0)) * (tier.ratio / gachaRequestForm.tiers.reduce((prev, tier) => prev + tier.ratio, 0)),
                  })) : [],
              }))
            }}
            theme={{ tooltip: { container: { color: '#333' } } }}
            cornerRadius={2}
            borderColor={{ theme: 'background' }}
            colors={{ scheme: 'pastel2' }}
            childColor={{
              from: 'color',
              modifiers: [
                [
                  'brighter',
                  0.2
                ]
              ]
            }}
            enableArcLabels={true}
            arcLabel={node => `${node.id}: ${node.formattedValue}`}
            arcLabelsSkipAngle={10}
          />
        </Box>
        <Stack justify='center'>
          <Box>
            <UnorderedList>
              <ListItem>{t('price_per_gacha_w_val', {
                price: gachaRequestForm.pricing.pricePerGacha
              })}</ListItem>
              {gachaRequestForm.pricing.discount && 
                <>
                  <ListItem>{t('price_per_n_gachas_w_val', {
                    count: gachaRequestForm.pricing.discountTrigger,
                    price: gachaRequestForm.pricing.discountedPricePerGacha * gachaRequestForm.pricing.discountTrigger
                  })}</ListItem>
                </>
              }
              {countWithinBudget >= 0 && <ListItem>{t('gacha_count_within_budget', {
                count: countWithinBudget,
                budget: gachaRequestForm.plan.budget
              })}</ListItem>}
              <ListItem>{t('effective_max_gachas', {
                count: effectiveMaxConsecutiveGachas
              })}</ListItem>
              {gachaRequestForm.policies.pity && gachaRequestForm.policies.pityItem &&
                <ListItem>{t('pity_trigger_w_item_name', {
                  count: gachaRequestForm.policies.pityTrigger,
                  name: gachaRequestForm.policies.pityItem.shortName
                })}</ListItem>
              }
              {gachaRequestForm.customizeItems &&
                <ListItem>{t('items_customized')}</ListItem>
              }
              {gachaRequestForm.plan.itemGoals && 
              <>
                <ListItem>{t('you_want_these_items')}</ListItem>
                <UnorderedList>
                  {gachaRequestForm.plan.wantedItems.map(wantedItem => (
                    <ListItem key={wantedItem.id}>{wantedItem.shortName}: {wantedItem.number}</ListItem>
                  ))}
                </UnorderedList>
              </>
              }
              {gachaRequestForm.plan.tierGoals && 
              <>
                <ListItem>{t('you_want_these_tiers')}</ListItem>
                <UnorderedList>
                  {gachaRequestForm.plan.wantedTiers.map(wantedTier => (
                    <ListItem key={wantedTier.id}>{wantedTier.shortName}: {wantedTier.number}</ListItem>
                  ))}
                </UnorderedList>
              </>
              }
            </UnorderedList>
          </Box>
        </Stack>
      </SimpleGrid>}
      <Flex>
        <Button variant="outline" onClick={() => navigate("../plan")}>{t('back')}</Button>
        <Spacer />
        <Button 
          colorScheme="blue"
          isDisabled={validationErrors.length > 0} 
          onClick={() => {
            onOpen();
            executeGacha();
          }}
        >{t('execute')}</Button>
        <Spacer />
      </Flex>
    </FormTemplate>
    <GachaResultModal 
      {...gachaResult}
      isOpen={isOpen}
      onClose={onClose}
      onClickRetry={executeGacha}
      loading={gachaExecuting}
      error={error}
    />
  </>;
}