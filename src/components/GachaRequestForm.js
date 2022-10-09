import { Center, Container, Spinner, useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import SidebarWithHeader from "./SidebarWithHeader";
import { cacheGameTitle } from "../utils/gameTitleSlice";
import { useGachaRequestForm } from "../utils/gachaHooks";
import { FiArchive, FiCircle, FiClipboard, FiCoffee, FiDollarSign, FiHome, FiLayers, FiSliders, FiStar } from "react-icons/fi";
import { useAuth } from "../auth/AuthContext";
import ReloadButton from "./ReloadButton";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import Footer from "./Footer";

const GachaRequestFormTemplate = ({ loaded, title, children }) => {
  const { t } = useTranslation();
  const linkItems = [
    {
      name: t('home'),
      to: '/',
      icon: FiHome
    },
    {
      name: t('presets'),
      to: 'presets',
      icon: FiStar
    },
    {
      name: t('tiers'),
      to: 'tiers',
      icon: FiLayers
    },
    {
      name: t('items'),
      to: 'items',
      icon: FiCircle
  
    },
    {
      name: t('pricing'),
      to: 'pricing',
      icon: FiDollarSign
    },
    {
      name: t('policies'),
      to: 'policies',
      icon: FiSliders
    },
    {
      name: t('plan'),
      to: 'plan',
      icon: FiClipboard
    },
    {
      name: t('review'),
      to: 'review',
      icon: FiCoffee
    },
    {
      name: t('results'),
      to: 'results',
      icon: FiArchive
    },
  ];
    
  return <SidebarWithHeader loaded={loaded} title={title} linkItems={linkItems}>
    <Container maxW={'5xl'}>
      {children}
    </Container>
    <Footer />
  </SidebarWithHeader>;
};

export default function GachaRequestForm({ children }) {
  const { authService } = useAuth();
  const { gameTitleSlug } = useParams();
  const { gameTitleCache } = useSelector((state) => state.gameTitle);
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const gameTitle = gameTitleCache[gameTitleSlug];
  const toast = useToast();
  const { t } = useTranslation();
  useGachaRequestForm();

  const loadGameTitle = useCallback(() => {
    setLoaded(false);
    fetch(`/api/game-titles/${gameTitleSlug}`, {
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
    .then(gameTitle => {
      dispatch(cacheGameTitle(gameTitle));
      setLoaded(true);
      setError(false);
    })
    .catch(() => {
      setLoaded(true);
      setError(true);
      toast({
        title: t('error.fetch_fail_game_title'),
        status: 'error',
        isClosable: true,
      });
    });
  }, [authService, dispatch, gameTitleSlug, t, toast]);

  useEffect(() => {
    if (!gameTitle) {
      loadGameTitle();
    } else {
      setLoaded(true);
      setError(false);
    }
  }, [gameTitle, loadGameTitle]);

  if (!loaded) {
    return <GachaRequestFormTemplate loaded={loaded}>
    <Center><Spinner /></Center>
  </GachaRequestFormTemplate>;
  }

  if (error || !gameTitle) {
    return <GachaRequestFormTemplate loaded={loaded}>
      <Center><ReloadButton onClick={loadGameTitle} /></Center>
    </GachaRequestFormTemplate>;
  }

  return <GachaRequestFormTemplate loaded={loaded} title={gameTitle.shortName}>{children}</GachaRequestFormTemplate>;
};
