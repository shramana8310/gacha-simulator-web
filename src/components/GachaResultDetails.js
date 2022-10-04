import { ChevronDownIcon } from "@chakra-ui/icons";
import { Button, Center, Divider, Menu, MenuButton, MenuItem, MenuList, Skeleton, useToast } from "@chakra-ui/react";
import i18next from "i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiChevronLeft, FiChevronRight, FiEye, FiList, FiShare2 } from "react-icons/fi";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useGachaResultShareCallbacks } from "../utils/gachaHooks";
import { FormTemplateWrapper } from "./FormTemplate";
import GachaResult from "./GachaResult";
import { NavigationButtonTemplate } from "./NavigationButtons";
import ReloadButton from "./ReloadButton";

export default function GachaResultDetails() {
  const { authService } = useAuth();
  const { resultId } = useParams();
  const [ gachaResult, setGachaResult ] = useState();
  const [ navigation, setNavigation ] = useState({
    nextAvailable: false,
    nextId: 0,
    prevAvailable: false,
    prevId: 0,
  });
  const { 
    nextAvailable, 
    nextId, 
    prevAvailable, 
    prevId, 
  } = useMemo(() => navigation, [navigation]);
  const [ loaded, setLoaded ] = useState(false);
  const [ updating, setUpdating ] = useState(false);
  const [ error, setError ] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const scrollRef = useRef();
  const { t } = useTranslation();

  const loadResult = useCallback(() => {
    setLoaded(false);
    fetch(`/api/gachas/${resultId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getAccessToken()}`,
        'Accept-Language': i18next.language,
      }
    })
    .then(response => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
    .then(gachaResultResponse => {
      const { 
        nextAvailable, 
        nextId, 
        prevAvailable, 
        prevId, 
        ...gachaResult
      } = gachaResultResponse;
      setGachaResult(gachaResult);
      setNavigation({ nextAvailable, nextId, prevAvailable, prevId });
      setLoaded(true);
      setError(false);
    })
    .catch(() => {
      setLoaded(true);
      setError(true);
      toast({
        title: t('error.fetch_fail_result'),
        status: 'error',
        isClosable: true,
      });
    });
  }, [authService, resultId, t, toast]);

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
    loadResult();
  }, [loadResult]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({behavior: 'smooth'});
    }
  }, [gachaResult]);

  if (error) {
    return <FormTemplateWrapper title={t('result_details')} ref={scrollRef}>
      <Center><ReloadButton onClick={loadResult} /></Center>
    </FormTemplateWrapper>;
  }

  return (
    <FormTemplateWrapper 
      title={t('result_details')} 
      ref={scrollRef}
      menu={
        <Menu>
          <MenuButton as={Button} isLoading={updating} rightIcon={<ChevronDownIcon />}>
            {t('menu')}
          </MenuButton>
          <MenuList>
            <MenuItem 
              onClick={togglePublic}
              icon={<FiEye />}
            >{t('toggle_public')}</MenuItem>
            <MenuItem 
              onClick={shareGacha}
              icon={<FiShare2 />}
            >{t('share')}</MenuItem>
            <MenuItem 
              onClick={() => navigate('../results')}
              icon={<FiList />}
            >{t('result_list')}</MenuItem>
            {prevAvailable && (
              <MenuItem 
                onClick={() => navigate(`../results/${prevId}`)}
                icon={<FiChevronLeft />}
                >{t('previous')}</MenuItem>
            )}
            {nextAvailable && (
              <MenuItem 
                onClick={() => navigate(`../results/${nextId}`)}
                icon={<FiChevronRight />}
              >{t('next')}</MenuItem>
            )}
          </MenuList>
        </Menu>
      }
    >
      <Skeleton isLoaded={loaded}>
        {gachaResult && 
        <GachaResult gachaResult={gachaResult} showPublicStat={true} />}
      </Skeleton>
      <Divider />
      <NavigationButtonTemplate 
        nextBtnDisabled={!nextAvailable}
        nextBtnLink={`../results/${nextId}`}
        prevBtnDisabled={!prevAvailable}
        prevBtnLink={`../results/${prevId}`}
      />
    </FormTemplateWrapper>
  );
}