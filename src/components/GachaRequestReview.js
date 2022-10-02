import { 
  Box, 
  SimpleGrid, 
  Stack,
  Button,
  Flex,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Text,
  Divider,
  Grid,
  GridItem,
  Center,
} from '@chakra-ui/react'
import { ResponsiveContainer, Treemap } from 'recharts';
import i18next from 'i18next';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oauth2-pkce';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useGachaRequestForm, useGachaResultShareCallbacks } from '../utils/gachaHooks';
import { FormTemplateWrapper } from './FormTemplate';
import GachaResult from './GachaResult';
import Item from './Item';
import Tier from './Tier';
import ValidationErrorAlerts from './ValidationErrorAlerts';
import CustomTreemapRect from './CustomTreemapRect';
import { FiChevronLeft, FiEye, FiList, FiPlay, FiRepeat, FiShare2 } from 'react-icons/fi';
import { ChevronDownIcon } from '@chakra-ui/icons';

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
    tierEntries,
    filteredWantedItems,
    effectiveItemGoals,
    filteredWantedTiers,
    effectiveTierGoals,
    treeMapData,
  } = useGachaRequestForm();
  const [gachaResult, setGachaResult] = useState();
  const [gachaExecuting, setGachaExecuting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const toast = useToast();
  const scrollRef = useRef();
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
        tiers: gachaRequestForm.tiers.map(tier => ({
            ...tier,
            items: gachaRequestForm.customizeItems ? gachaRequestForm.items.filter(item => item.tier.id === tier.id)
              .map(item => ({
                id: item.id,
                ratio: item.ratio,
              })) : [],
          }))
          .filter(tier => gachaRequestForm.customizeItems ? tier.items.length > 0 : true),
        itemsIncluded: gachaRequestForm.customizeItems,
        pricing: gachaRequestForm.pricing,
        policies: gachaRequestForm.policies,
        plan: {
          ...gachaRequestForm.plan,
          itemGoals: effectiveItemGoals,
          wantedItems: filteredWantedItems,
          tierGoals: effectiveTierGoals,
          wantedTiers: filteredWantedTiers,
        },
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
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({behavior: 'smooth'});
      }
    })
    .catch(() => {
      setGachaExecuting(false);
      toast({
        title: t('error.fetch_fail_gacha'),
        status: 'error',
        isClosable: true,
      });
    });
  };

  const { togglePublic, shareGacha } = useGachaResultShareCallbacks({
    authService,
    gachaResult,
    i18next,
    setGachaResult,
    setUpdating,
    toast,
    t,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, []);

  if (gachaResult) {
    const menu = <Menu>
                  <MenuButton as={Button} isLoading={gachaExecuting || updating} rightIcon={<ChevronDownIcon />}>
                    {t('menu')}
                  </MenuButton>
                  <MenuList>
                    <MenuItem 
                      onClick={executeGacha}
                      icon={<FiRepeat />}
                    >{t('retry')}</MenuItem>
                    <MenuItem 
                      onClick={togglePublic}
                      icon={<FiEye />}
                    >{t('toggle_public')}</MenuItem>
                    <MenuItem 
                      onClick={shareGacha}
                      icon={<FiShare2 />}
                    >{t('share')}</MenuItem>
                    <MenuItem 
                      onClick={() => navigate("../results")}
                      icon={<FiList />}
                    >{t('result_list')}</MenuItem>
                    <MenuItem 
                      onClick={() => setGachaResult(null)}
                      icon={<FiChevronLeft />}
                    >{t('back')}</MenuItem>
                  </MenuList>
                </Menu>;
    return <>
      <FormTemplateWrapper 
        ref={scrollRef} 
        title={t('result')} 
        menu={menu}
      >
        <GachaResult gachaResult={gachaResult} showConfetti={true} showPublicStat={true} />
        <Divider />
        <Flex>
          <Button 
            variant="ghost" 
            onClick={() => setGachaResult(null)}
            leftIcon={<FiChevronLeft />}
          >{t('back')}</Button>
          <Spacer />
          <Button 
            isLoading={gachaExecuting || updating}
            colorScheme="green"
            isDisabled={validationErrors.length > 0} 
            onClick={executeGacha}
            leftIcon={<FiRepeat />}
          >{t('retry')}</Button>
          <Spacer />
          {menu}
        </Flex>
      </FormTemplateWrapper>
    </>;
  }

  return <>
    <FormTemplateWrapper ref={scrollRef} title={t('review')}>
      <ValidationErrorAlerts validationErrors={validationErrors} link={true} />
      {validationErrors.length === 0 && 
        <Stack spacing={5}>
          <SimpleGrid columns={{base: 2, md: 3, lg: 4}} spacing={2}>
            {tierEntries.map(tierEntry => 
              <Stat key={tierEntry.tier.id}>
                <StatLabel>{tierEntry.tier.name}</StatLabel>
                <StatNumber>{t('formatted_percentage', {val: tierEntry.percentage})}</StatNumber>
                <StatHelpText>{t('formatted_integer', {integer: tierEntry.tier.ratio})} / {t('formatted_integer', {integer: tierEntry.tierRatioSum})}</StatHelpText>
              </Stat>
              )}
          </SimpleGrid>
          {gachaRequestForm.customizeItems &&
            <Text>{t('items_customized')}</Text>}
          <Box h={200}>
            <ResponsiveContainer>
              <Treemap data={treeMapData} dataKey='ratio' isAnimationActive={false} content={<CustomTreemapRect />} />
            </ResponsiveContainer>
          </Box>
          <SimpleGrid columns={{base: 2, md: 3, lg: 4}} spacing={2}>
            {gachaRequestForm.pricing.pricePerGacha > 0 && 
              <Stat>
                <StatLabel>{t('price_per_gacha')}</StatLabel>
                <StatNumber>{t('formatted_integer', {integer: gachaRequestForm.pricing.pricePerGacha})}</StatNumber>
              </Stat>}
            {gachaRequestForm.pricing.discount && gachaRequestForm.pricing.discountedPricePerGacha > 0 && 
              <Stat>
                <StatLabel>{t('discount_price_per_n_gachas', {count: gachaRequestForm.pricing.discountTrigger})}</StatLabel>
                <StatNumber>{t('formatted_integer', {integer: gachaRequestForm.pricing.discountedPricePerGacha * gachaRequestForm.pricing.discountTrigger})}</StatNumber>
              </Stat>}
            {countWithinBudget >= 0 &&
              <Stat>
                <StatLabel>{t('gacha_count_within_budget')}</StatLabel>
                <StatNumber>{t('formatted_integer', {integer: countWithinBudget})}</StatNumber>
                <StatHelpText>{t('budget')} {t('formatted_integer', {integer: gachaRequestForm.plan.budget})}</StatHelpText>
              </Stat>}
            <Stat>
              <StatLabel>{t('effective_max_gachas')}</StatLabel>
              <StatNumber>{t('formatted_integer', {integer: effectiveMaxConsecutiveGachas})}</StatNumber>
            </Stat>
          </SimpleGrid>
          {gachaRequestForm.policies.pity && gachaRequestForm.policies.pityItem &&
            <Stack>
              <Text>{t('pity_item_w_trigger', {count: gachaRequestForm.policies.pityTrigger})}</Text>
              <SimpleGrid columns={{base: 2, md: 3, lg: 4}} spacing={2}>
                <Item {...gachaRequestForm.policies.pityItem} tierName={gachaRequestForm.policies.pityItem.tier.shortName} />
              </SimpleGrid>
            </Stack>
          }
          {effectiveItemGoals && 
          <Stack>
            <Text>{t('wanted_items')}</Text>
            <SimpleGrid columns={{base: 2, md: 3, lg: 4}} spacing={2}>
              {filteredWantedItems.map(wantedItem => (
                <Item key={wantedItem.id} {...wantedItem} tierName={wantedItem.tier.shortName}>
                  <Stat>
                    <StatNumber>{wantedItem.number}</StatNumber>
                  </Stat>
                </Item>
              ))}
            </SimpleGrid>
          </Stack>}
          {effectiveTierGoals && 
            <Stack>
              <Text>{t('wanted_tiers')}</Text>
              <SimpleGrid columns={{base: 2, md: 3, lg: 4}} spacing={2}>
                {filteredWantedTiers.map(wantedTier => (
                  <Tier key={wantedTier.id} {...wantedTier}>
                    <Stat>
                      <StatNumber>{wantedTier.number}</StatNumber>
                    </Stat>
                  </Tier>
                ))}
              </SimpleGrid>
            </Stack>}
        </Stack>}
      <Divider />
      <Grid templateColumns='repeat(3,1fr)'>
        <GridItem>
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            leftIcon={<FiChevronLeft />}
          >{t('back')}</Button>
        </GridItem>
        <GridItem>
          <Center>
            <Button 
              isLoading={gachaExecuting || updating}
              colorScheme="green"
              isDisabled={validationErrors.length > 0} 
              leftIcon={<FiPlay />}
              onClick={executeGacha}
            >{t('execute')}</Button>
          </Center>
        </GridItem>
      </Grid>
    </FormTemplateWrapper>
  </>;
}