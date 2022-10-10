import { CheckIcon, NotAllowedIcon, } from '@chakra-ui/icons';
import {
  ListItem,
  UnorderedList,
  Text,
  Stack,
  SimpleGrid,
  Button,
  Center,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Portal,
  Box,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Confetti from 'react-dom-confetti';
import Item from './Item';

const UNIT_NUMBER_OF_ITEMS_TO_SHOW = 20;

function getItemEntries(itemIDs, items, remainingWantedItems, wantedItems) {
  const itemMap = itemIDs
    .map(id => items.find(item => item.id === id))
    .reduce((prev, item) => {
      if (prev[item.id]) {
        ++prev[item.id].count;
      } else {
        prev[item.id] = {
          item: item,
          count: 1,
        };
      }
      return prev;
    }, {});
  remainingWantedItems.forEach(remainingWantedItem => {
    itemMap[remainingWantedItem.id] = {
      item: remainingWantedItem,
      count: 0,
    }
  });
  return Object.keys(itemMap)
    .map(key => itemMap[key])
    .map(itemEntry => ({
      ...itemEntry,
      percentage: itemEntry.count / itemIDs.length,
      wantedItem: wantedItems.hasOwnProperty(itemEntry.item.id),
      wantedCount: wantedItems[itemEntry.item.id] || 0,
    }))
    .sort((a, b) => {
      if (a.wantedItem === b.wantedItem) {
        if (a.item.tier.id === b.item.tier.id) {
          return a.count - b.count;
        } else {
          return a.item.tier.ratio - b.item.tier.ratio;
        }
      } else {
        if (a.wantedItem && !b.wantedItem) {
          return -1;
        } else {
          return 1;
        }
      }
    });
}

function getTierEntries(itemIDs, items, remainingWantedTiers, wantedTiers) {
  const tierMap = itemIDs.map(id => items.find(item => item.id === id))
    .map(item => item.tier)
    .reduce((prev, tier) => {
      if (prev[tier.id]) {
        ++prev[tier.id].count;
      } else {
        prev[tier.id] = {
          tier: tier,
          count: 1,
        };
      }
      return prev;
    }, {});
    remainingWantedTiers.forEach(remainingWantedTier => {
      tierMap[remainingWantedTier.id] = {
        tier: remainingWantedTier,
        count: 0,
      }
    });
    return Object.keys(tierMap)
    .map(key => tierMap[key])
    .map(tierEntry => ({
      ...tierEntry,
      percentage: tierEntry.count / itemIDs.length,
      wantedTier: wantedTiers.hasOwnProperty(tierEntry.tier.id),
      wantedCount: wantedTiers[tierEntry.tier.id] || 0,
    }))
    .sort((a, b) => a.tier.ratio - b.tier.ratio);
}

export default function GachaResult({
  gachaResult,
  showPublicStat,
  showConfetti,
}) {
  const {
    id,
    itemIDs,
    items,
    moneySpent,
    goalsAchieved,
    time,
    request,
    remainingWantedItems,
    remainingWantedTiers,
  } = gachaResult;
  const itemEntries = useMemo(() => getItemEntries(itemIDs, items, remainingWantedItems, request.plan.wantedItems), 
    [itemIDs, items, remainingWantedItems, request.plan.wantedItems]);
  const tierEntries = useMemo(() => getTierEntries(itemIDs, items, remainingWantedTiers, request.plan.wantedTiers), 
    [itemIDs, items, remainingWantedTiers, request.plan.wantedTiers]);
  const [moreCount, setMoreCount] = useState(0);
  const displayedItemsCount = useMemo(() => UNIT_NUMBER_OF_ITEMS_TO_SHOW * (1 + moreCount), [moreCount]);
  const itemsTruncated = useMemo(() => displayedItemsCount < items.length, [displayedItemsCount, items.length]);
  const { t } = useTranslation();
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => {
    setMoreCount(0);
  }, [id]);

  useEffect(() => {
    if (showConfetti) {
      setTimeout(() => {
        setConfettiActive(goalsAchieved);
        setTimeout(() => setConfettiActive(false), 500);
      }, 500);
    }
  }, [showConfetti, id, goalsAchieved]);

  return <>
    <Stack spacing={5}>
      {showPublicStat && 
        <Box>
          <Stat>
            <StatLabel>{t('public')}</StatLabel>
            <StatNumber>
              {gachaResult.public ? 
                <CheckIcon color={'green.500'} /> : 
                <NotAllowedIcon color={'red.500'} />}
            </StatNumber>
            <StatHelpText>{t('public_result_can_be_shared')}</StatHelpText>
          </Stat>
        </Box>}
      <SimpleGrid columns={{base: 2, md: 3, lg: 4}} spacing={2}>
        {(request.plan.itemGoals || request.plan.tierGoals) &&
          <Stat>
            <StatLabel>{t('goals_achieved')}</StatLabel>
            <StatNumber>
              {goalsAchieved ? 
                <CheckIcon color={'green.500'} /> : 
                <NotAllowedIcon color={'red.500'} />}
            </StatNumber>
          </Stat>}
        {moneySpent > 0 && 
        <Stat>
          <StatLabel>{t('money_spent')} / {t('budget')}</StatLabel>
          <StatNumber>{t('formatted_integer', {integer: moneySpent})} / {t('formatted_integer', {integer: request.plan.budget})}</StatNumber>
        </Stat>}
        <Stat>
          <StatLabel>{t('item_count')} / {t('max_gachas')}</StatLabel>
          <StatNumber>{t('formatted_integer', {integer: itemIDs.length})} / {t('formatted_integer', {integer: request.plan.maxConsecutiveGachas})}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>{t('unique_items')}</StatLabel>
          <StatNumber>{t('formatted_integer', {integer: items.length})}</StatNumber>
        </Stat>
      </SimpleGrid>
      <SimpleGrid columns={{base: 2, md: 3, lg: 4}} spacing={2}>
        {tierEntries.map((tierEntry, i) =>
          <Stat key={i}>
            <StatLabel>{tierEntry.tier.shortName}</StatLabel>
            <StatNumber color={tierEntry.wantedTier ? (tierEntry.count >= tierEntry.wantedCount ? 'green.300' : 'red.300') : undefined}>
              {t('formatted_integer', {integer: tierEntry.count})} {tierEntry.wantedTier && ` / ${t('formatted_integer', {integer: tierEntry.wantedCount})}`}
            </StatNumber>
            <StatHelpText>{t('formatted_percentage', {val: tierEntry.percentage})}</StatHelpText>
          </Stat>)}
      </SimpleGrid>
      <SimpleGrid columns={{base: 2, md: 3, lg: 4}} spacing={2}>
        {itemEntries.slice(0, displayedItemsCount).map((itemEntry, i) => 
          <Item 
            {...itemEntry.item} 
            tierName={itemEntry.item.tier.shortName} 
            emphasizeBorder={itemEntry.wantedItem} 
            borderColor={itemEntry.wantedItem ? 
              (itemEntry.count > 0 ? 
                (itemEntry.count >= itemEntry.wantedCount ? 'green.300' : 'yellow.300') 
                : 'red.300') 
              : undefined}
            key={i}
          >
            <Stat>
              <StatLabel>{itemEntry.item.name}</StatLabel>
              <StatNumber color={itemEntry.wantedItem ? (itemEntry.count >= itemEntry.wantedCount ? 'green.300' : 'red.300') : undefined}>
                {t('formatted_integer', {integer: itemEntry.count})} {itemEntry.wantedItem && ` / ${t('formatted_integer', {integer: itemEntry.wantedCount})}`}
              </StatNumber>
              <StatHelpText>{t('formatted_percentage', {val: itemEntry.percentage})}</StatHelpText>
            </Stat>
          </Item>)}
      </SimpleGrid>
      {itemsTruncated && 
        <Center minH={50}>
          <Button onClick={() => setMoreCount(moreCount + 1)}>{t('more')}</Button>
        </Center>}
      <UnorderedList styleType='none'>
        <ListItem><Text fontSize='xs' color='gray.500'>{t('id')}: {id}</Text></ListItem>
        <ListItem><Text fontSize='xs' color='gray.500'>{t('formatted_datetime', {val: new Date(time)})}</Text></ListItem>
      </UnorderedList>
    </Stack>
    <Portal>
      <div style={{
        position: 'absolute', 
        left: '50%',
        top: 300
      }}>
        <Confetti active={confettiActive} config={{
          angle: 90,
          spread: 360,
          startVelocity: 40,
          elementCount: 70,
          dragFriction: 0.12,
          duration: 3000,
          stagger: 3,
          width: "10px",
          height: "10px",
          perspective: "500px",
          colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
        }} />
      </div>
    </Portal>
  </>;
};