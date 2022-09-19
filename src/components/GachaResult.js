import { CheckIcon, NotAllowedIcon, } from '@chakra-ui/icons';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  ListItem,
  UnorderedList,
  Text,
  Tooltip,
  Stack,
  Image,
  Flex,
  Spacer,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

function sortedItems(itemIDs, items) {
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
  return Object.keys(itemMap)
    .map(key => itemMap[key])
    .map(itemEntry => ({
      ...itemEntry,
      percentage: Math.round((itemEntry.count / itemIDs.length) * 100 * 100) / 100,
    }))
    .sort((a, b) => a.item.tier.id === b.item.tier.id ? a.count - b.count : b.item.tier.id - a.item.tier.id);
}

export default function GachaResult({
  id,
  itemIDs = [],
  items = [],
  moneySpent,
  goalsAchieved,
  time,
}) {
  const { t } = useTranslation();
  return <>
    <Stack>
      <UnorderedList>
        <ListItem>{t('id')}: {id}</ListItem>
        <ListItem>
          <HStack>
            <Text>{t('goals_achieved')}: </Text>
            {goalsAchieved ? 
              <CheckIcon color={'green.500'} /> : 
              <NotAllowedIcon color={'red.500'} />}
          </HStack>
        </ListItem>
        <ListItem>{t('item_count')}: {itemIDs.length}</ListItem>
        <ListItem>{t('unique_items')}: {items.length}</ListItem>
        <ListItem>{t('money_spent')}: {t('formatted_integer', {integer: moneySpent})}</ListItem>
      </UnorderedList>
      <TableContainer>
        <Table size='sm'>
          <Thead>
            <Tr>
              <Th>{t('item')}</Th>
              <Th isNumeric>{t('count')}</Th>
              <Th isNumeric>{t('percentage')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedItems(itemIDs, items).map((entry, i) => 
            <Tr key={i}>
              <Td>
                <HStack>
                  <Image boxSize='60px' src={entry.item.imageUrl} loading='lazy' />
                  <Tooltip label={entry.item.name}>
                    <Text>{entry.item.shortName}</Text>
                  </Tooltip>
                  <Badge>{entry.item.tier.shortName}</Badge>
                </HStack>
              </Td>
              <Td isNumeric>{entry.count}</Td>
              <Td isNumeric>{entry.percentage}%</Td>
            </Tr>)}
          </Tbody>
        </Table>
      </TableContainer>
      <Flex>
        <Spacer />
        <Text fontSize='xs'>{new Date(time).toLocaleString()}</Text>
      </Flex>
    </Stack>
  </>;
};