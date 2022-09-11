import {
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Switch,
  HStack,
  Text,
  Center,
  useToast,
  Skeleton,
  Hide,
  Alert,
  AlertIcon,
  Link,
} from '@chakra-ui/react'
import { CheckIcon, NotAllowedIcon } from '@chakra-ui/icons';
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "react-oauth2-pkce";
import { Link as RouterLink, useParams, useSearchParams } from "react-router-dom";
import ReloadButton from './ReloadButton';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import FormTemplate from './FormTemplate';

const GachaResultListTemplate = ({isLoaded, children}) => {
  const { t } = useTranslation();
  return <>
    <FormTemplate title={t('results')}>
      <Skeleton isLoaded={isLoaded}>
        <Stack spacing={5}>
          {children}
        </Stack>
      </Skeleton>
    </FormTemplate>
  </>;
};

export default function GachaResultList() {
  const { authService } = useAuth();
  const { gameTitleSlug } = useParams();
  const [ searchParams ] = useSearchParams();
  const [ pagination, setPagination ] = useState();
  const [ gachaResults, setGachaResults ] = useState();
  const [ loaded, setLoaded ] = useState(false);
  const [ updating, setUpdating ] = useState(false);
  const [ error, setError ] = useState(false);
  const toast = useToast();
  const { t } = useTranslation();

  const loadResults = useCallback(() => {
    setLoaded(false);
    const pageIndex = searchParams.has('pageIndex') ? searchParams.get('pageIndex') : 0;
    fetch(`/api/game-titles/${gameTitleSlug}/gachas?` + new URLSearchParams({
      pageIndex: pageIndex
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getAuthTokens().access_token}`,
        'Accept-Language': i18next.language,
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error();
      }
      return response.json();
    })
    .then(gachaResultsPagination => {
      setPagination(gachaResultsPagination);
      setGachaResults(gachaResultsPagination.data);
      setLoaded(true);
      setError(false);
    })
    .catch(() => {
      setLoaded(true);
      setError(true);
      toast({
        title: t('error.fetch_fail_results'),
        status: 'error',
        isClosable: true,
      });
    });
  }, [authService, gameTitleSlug, searchParams, t, toast]);

  const togglePublic = (gachaResultID, value) => {
    setUpdating(true);
    fetch(`/api/gachas/${gachaResultID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getAuthTokens().access_token}`,
        'Accept-Language': i18next.language,
      },
      body: JSON.stringify({
        public: value
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error();
      }
      return response;
    })
    .then(() => {
      const i = gachaResults.findIndex(gachaResult => gachaResult.id === gachaResultID);
      setUpdating(false);
      setGachaResults([
        ...gachaResults.slice(0, i),
        {
          ...gachaResults[i],
          public: value,
        },
        ...gachaResults.slice(i+1)
      ]);
    })
    .catch(() => {
      setUpdating(false);
      toast({
        title: t('error.fetch_fail_public_switch'),
        status: 'error',
        isClosable: true,
      });
    });
  };

  const copyURL = (gachaResultID) => {
    var url = `${window.location.origin}/results/${gachaResultID}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          toast({
            title: t('url_copied'),
            status: 'success',
            isClosable: true,
          });
        })
        .catch(() => {
          toast({
            title: t('error.url_copy_fail', { url: url }),
            status: 'error',
            isClosable: true,
          });
        });
    } else {
      toast({
        title: t('error.url_copy_fail', { url: url }),
        status: 'error',
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  if (error) {
    return (
      <GachaResultListTemplate isLoaded={loaded}>
        <Center><ReloadButton onClick={loadResults} /></Center>
      </GachaResultListTemplate>
    );
  }

  if (pagination && pagination.count === 0) {
    return (
      <GachaResultListTemplate isLoaded={loaded}>
        <Alert status='info'>
          <AlertIcon />
          {t('no_gacha_results_available')}
        </Alert>
      </GachaResultListTemplate>
    );
  }

  return (
    <GachaResultListTemplate isLoaded={loaded}>
      <TableContainer>
        <Table size='sm'>
          <Thead>
            <Tr>
              <Th>{t('id')}</Th>
              <Th textAlign='center'>{t('goals')}</Th>
              <Hide below='sm'>
                <Th isNumeric>{t('item_count')}</Th>
                <Th isNumeric>{t('money_spent')}</Th>
                <Th>{t('time')}</Th>
              </Hide>
              <Th textAlign='center'>{t('details')}</Th>
              <Th textAlign='center'>{t('public')}</Th>
              <Th textAlign='center'>{t('url')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {gachaResults && gachaResults.map(gachaResult => (
              <Tr key={gachaResult.id}>
                <Td>{gachaResult.id}</Td>
                <Td textAlign='center'>
                  {gachaResult.goalsAchieved ? 
                  <CheckIcon color={'green.500'} /> : 
                  <NotAllowedIcon color={'red.500'} />}
                </Td>
                <Hide below='sm'>
                  <Td isNumeric>{gachaResult.itemIDs.length}</Td>
                  <Td isNumeric>{t('formatted_integer', {integer: gachaResult.moneySpent})}</Td>
                  <Td>{new Date(gachaResult.time).toLocaleString()}</Td>
                </Hide>
                <Td textAlign='center'>
                  <Link as={RouterLink} to={`${gachaResult.id}`}>{t('show')}</Link>
                </Td>
                <Td textAlign='center'>
                  <Switch 
                    size='sm'
                    isDisabled={updating} 
                    isChecked={gachaResult.public} 
                    onChange={e => togglePublic(gachaResult.id, e.target.checked)} 
                  />
                </Td>
                <Td textAlign='center'>
                  {gachaResult.public ? 
                  <Link onClick={e => copyURL(gachaResult.id)}>{t('copy')}</Link>
                  : 
                  <Text>N/A</Text>}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Center>
        <HStack>
          {pagination && 
          [...Array(pagination.pageTotal).keys()]
          .map(i => {
            const span = 5;
            const floor = pagination.pageIndex - (span / 2);
            const ceil = pagination.pageIndex + (span / 2);
            if ((floor < i && i < ceil) || i === 0 || i === pagination.pageTotal-1) {
              return i;
            } else if (i >= ceil) {
              return -1;  // ellipsis
            } else {
              return -2;  // ellipsis
            }
          })
          .filter((value, index, arr) => arr.indexOf(value) === index)
          .map(i => {
            if (i < 0) {
              return <Text key={i}>...</Text>;
            } else if (i === pagination.pageIndex) {
              return <Text color='blue.500' key={i}>{i+1}</Text>
            } else {
              return <Link as={RouterLink} to={`?pageIndex=${i}`} key={i}><Text>{i+1}</Text></Link>;
            }
          })}
        </HStack>
      </Center>
    </GachaResultListTemplate>
  );
}