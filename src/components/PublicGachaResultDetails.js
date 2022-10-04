import { Center, Container, Heading, Link, Spinner, Stack, useToast } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import i18next from "i18next";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { useParams } from "react-router-dom";
import GachaResult from "./GachaResult";
import NotFoundPage from "./NotFoundPage";
import ReloadButton from "./ReloadButton";

const PublicGachaResultDetailsTemplate = ({children}) => {
  return (
    <Container maxW={'6xl'} p={10}>{children}</Container>
  );
};

export default function PublicGachaResultDetails() {
  const { authService } = useAuth();
  const { resultId } = useParams();
  const [ gachaResult, setGachaResult ] = useState();
  const [ loaded, setLoaded ] = useState(false);
  const [ error, setError ] = useState(false);
  const [ notFound, setNotFound ] = useState(false);
  const toast = useToast();
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
    .then(gachaResult => {
      setGachaResult(gachaResult);
      setLoaded(true);
      setError(false);
      setNotFound(false);
    })
    .catch((response) => {
      setLoaded(true);
      if (response.status >= 400 && response.status < 500) {
        setNotFound(true);
        setError(false);
      } else {
        setError(true);
        toast({
          title: t('error.fetch_fail_result'),
          status: 'error',
          isClosable: true,
        });
      }
    });
  }, [authService, resultId, t, toast]);

  useEffect(() => {
    loadResult();
  }, [loadResult]);

  if (!loaded) {
    return (
      <PublicGachaResultDetailsTemplate>
        <Center><Spinner /></Center>
      </PublicGachaResultDetailsTemplate>
    );
  }

  if (notFound) {
    return <NotFoundPage />;
  }

  if (error) {
    return (
      <PublicGachaResultDetailsTemplate>
        <Center><ReloadButton onClick={loadResult} /></Center>
      </PublicGachaResultDetailsTemplate>
    );
  }

  return (
    <PublicGachaResultDetailsTemplate>
      {gachaResult && 
      <Stack spacing={5}>
        <Heading>{t('gacha_result_of_game_title', {gameTitle: gachaResult.gameTitle.shortName})}</Heading>
        <GachaResult gachaResult={gachaResult} showPublicStat={false} />
        <Center><Link as={RouterLink} to={'/'}>{t('home')}</Link></Center>
      </Stack>}
    </PublicGachaResultDetailsTemplate>
  );
};