import { Button, Center, Flex, Skeleton, Spacer, Stack, useToast } from "@chakra-ui/react";
import i18next from "i18next";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "react-oauth2-pkce";
import { useNavigate, useParams } from "react-router-dom";
import FormTemplate from "./FormTemplate";
import GachaResult from "./GachaResult";
import NotFoundAlert from "./NotFoundAlert";
import ReloadButton from "./ReloadButton";

const GachaResultDetailsTemplate = ({isLoaded, children}) => {
  const { t } = useTranslation();
  return <>
    <FormTemplate title={t('result_details')}>
      <Skeleton isLoaded={isLoaded}>
        <Stack spacing={5}>
          {children}
        </Stack>
      </Skeleton>
    </FormTemplate>
  </>;
};

export default function GachaResultDetails({ showPublicOnly }) {
  const { authService } = useAuth();
  const { resultID } = useParams();
  const [ gachaResult, setGachaResult ] = useState();
  const [ loaded, setLoaded ] = useState(false);
  const [ error, setError ] = useState(false);
  const [ notFound, setNotFound ] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const loadResult = useCallback(() => {
    setLoaded(false);
    fetch(`/api/gachas/${resultID}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getAuthTokens().access_token}`,
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
    .catch(response => {
      setLoaded(true);
      if (response.status >= 400 && response.status < 500) {
        setError(false);
        setNotFound(true);
      } else {
        setError(true);
        setNotFound(false);
        toast({
          title: t('error.fetch_fail_result'),
          status: 'error',
          isClosable: true,
        });
      }
    });
  }, [authService, resultID, t, toast]);

  useEffect(() => {
    loadResult();
  }, [loadResult]);

  if (error) {
    return <GachaResultDetailsTemplate isLoaded={loaded}>
      <Center><ReloadButton onClick={loadResult} /></Center>
    </GachaResultDetailsTemplate>;
  }

  if (notFound) {
    return <GachaResultDetailsTemplate isLoaded={loaded}>
      <NotFoundAlert />
    </GachaResultDetailsTemplate>;
  }

  return <GachaResultDetailsTemplate isLoaded={loaded}>
    {gachaResult && <GachaResult {...gachaResult} />}
    {!showPublicOnly && 
    <Flex>
      <Button variant="outline" onClick={() => navigate(-1)}>{t('back')}</Button>
      <Spacer />
    </Flex>}
    
  </GachaResultDetailsTemplate>;
}