import {
  Stack,
  Text,
  Center,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
  SimpleGrid,
  UnorderedList,
  ListItem,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Box,
  Divider,
} from '@chakra-ui/react'
import { CheckIcon, NotAllowedIcon } from '@chakra-ui/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ReloadButton from './ReloadButton';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { FormTemplateWrapper } from './FormTemplate';
import { NavigationButtonTemplate } from './NavigationButtons';

const GachaResultBox = ({gachaResult, ...rest}) => {
  const { id, goalsAchieved, itemIDs, moneySpent, time } = gachaResult;
  const { t } = useTranslation();
  return (
    <Box
      as='button'
      borderWidth='1px' 
      borderRadius='lg' 
      boxShadow='lg'
      p={3}
      {...rest}
    >
      <Stack spacing={2}>
        <StatGroup>
          <Stat>
            <StatLabel>{t('goals_achieved')}</StatLabel>
            <StatNumber>
              {goalsAchieved ? 
                <CheckIcon color={'green.500'} /> : 
                <NotAllowedIcon color={'red.500'} />}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel>{t('public')}</StatLabel>
            <StatNumber>
              {gachaResult.public ? 
                <CheckIcon color={'green.500'} /> : 
                <NotAllowedIcon color={'red.500'} />}
            </StatNumber>
          </Stat>
        </StatGroup>
        <StatGroup>
          <Stat>
            <StatLabel>{t('item_count')}</StatLabel>
            <StatNumber>{t('formatted_integer', {integer: itemIDs.length})}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>{t('money_spent')}</StatLabel>
            <StatNumber>{t('formatted_integer', {integer: moneySpent})}</StatNumber>
          </Stat>
        </StatGroup>
        <Divider />
        <UnorderedList styleType='none' textAlign={'start'}>
          <ListItem><Text fontSize='xs' color='gray.500'>{t('id')}: {id}</Text></ListItem>
          <ListItem><Text fontSize='xs' color='gray.500'>{t('formatted_datetime', {val: new Date(time)})}</Text></ListItem>
        </UnorderedList>
      </Stack>
    </Box>
  );
};

export default function GachaResultList() {
  const { authService } = useAuth();
  const { gameTitleSlug } = useParams();
  const [ searchParams ] = useSearchParams();
  const [ pagination, setPagination ] = useState();
  const [ gachaResults, setGachaResults ] = useState([]);
  const [ loaded, setLoaded ] = useState(false);
  const [ error, setError ] = useState(false);
  const { nextPageExists, nextPageIndex, prevPageExists, prevPageIndex } = useMemo(() => {
    if (pagination) {
      const { pageIndex, pageTotal } = pagination;
      return {
        nextPageExists: pageIndex < pageTotal - 1, 
        nextPageIndex: pageIndex + 1, 
        prevPageExists: pageIndex > 0, 
        prevPageIndex: pageIndex - 1,
      }
    } else {
      return {
        nextPageExists: false, 
        nextPageIndex: 0, 
        prevPageExists: false, 
        prevPageIndex: 0,
      };
    }
  }, [pagination]);
  const toast = useToast();
  const navigate = useNavigate();
  const scrollRef = useRef();
  const { t } = useTranslation();

  const loadResults = useCallback(() => {
    setLoaded(false);
    const pageIndex = searchParams.has('pageIndex') ? searchParams.get('pageIndex') : 0;
    fetch(`/api/game-titles/${gameTitleSlug}/gachas?` + new URLSearchParams({
      pageIndex: pageIndex
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getAccessToken()}`,
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

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, [gachaResults]);

  if (error) {
    return (
      <FormTemplateWrapper title={t('result_list')} ref={scrollRef}>
        <Center><ReloadButton onClick={loadResults} /></Center>
      </FormTemplateWrapper>
    );
  }

  if (pagination && pagination.count === 0) {
    return (
      <FormTemplateWrapper title={t('result_list')} ref={scrollRef}>
        <Alert status='info'>
          <AlertIcon />
          {t('no_gacha_results_available')}
        </Alert>
      </FormTemplateWrapper>
    );
  }

  return (
    <FormTemplateWrapper title={t('result_list')} ref={scrollRef}>
      <Skeleton isLoaded={loaded}>
        <SimpleGrid columns={{base: 1, md: 2, lg: 2}} spacing={5}>
          {gachaResults.map((gachaResult) => (
            <GachaResultBox key={gachaResult.id} gachaResult={gachaResult} onClick={() => navigate(`./${gachaResult.id}`)} />
          ))}
        </SimpleGrid>
      </Skeleton>
      <Divider />
      <NavigationButtonTemplate 
        nextBtnDisabled={!nextPageExists}
        nextBtnLink={`?pageIndex=${nextPageIndex}`}
        prevBtnDisabled={!prevPageExists}
        prevBtnLink={`?pageIndex=${prevPageIndex}`}
      />
    </FormTemplateWrapper>
  );
}