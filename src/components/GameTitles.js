import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AspectRatio,
  ButtonGroup,
  Center,
  Container,
  Flex,
  Heading,
  Image,
  SimpleGrid,
  Spacer,
  Spinner,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useDispatch } from "react-redux";
import { cacheGameTitle, clearGameTitleCache } from "../utils/gameTitleSlice";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import ReloadButton from "./ReloadButton";
import i18next from "i18next";
import Footer from "./Footer";
import ColorModeToggleButton from "./ColorModeToggleButton";
import LanguageMenu from "./LanguageMenu";
import { initializeGachaRequestFormMap } from "../utils/gachaRequestFormSlice";

const GameTitle = ({ 
  name, 
  shortName, 
  description, 
  imageUrl,
}) => {
  return (
    <Stack
      borderWidth='1px' 
      borderRadius='lg' 
      boxShadow='lg'
      p={2}
    >
      <AspectRatio ratio={4 / 3}>
        <Image src={imageUrl} borderRadius='lg' loading='lazy' />
      </AspectRatio>
      <Heading size='lg' textAlign='center'>{shortName}</Heading>
      <Text fontSize='lg'>{name}</Text>
      <Text noOfLines={3}>{description}</Text>
    </Stack>
  )
};

const GameTitlesTemplate = ({children}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  return (
    <Container maxW={'5xl'} p={5}>
      <Stack spacing={10}>
        <Flex alignItems='center' gap='2'>
          <Spacer />
          <Spacer />
          <Heading size='lg' noOfLines={1}>{t('gacha_simulator')}</Heading>
          <Spacer />
          <ButtonGroup gap='2'>
            <ColorModeToggleButton />
            <LanguageMenu onLanguageChange={() => {
              dispatch(clearGameTitleCache());
              dispatch(initializeGachaRequestFormMap());
            }} />
          </ButtonGroup>
        </Flex>
        {children}
      </Stack>
      <Footer />
    </Container>
  );
};

export default function GameTitles() {
  const [loading, setLoading] = useState(false);
  const [gameTitles, setGameTitles] = useState([]);
  const dispatch = useDispatch();
  const { authService } = useAuth();
  const [error, setError] = useState(false);
  const toast = useToast();
  const { t } = useTranslation();

  const loadGameTitles = useCallback(() => {
    setLoading(true);
    fetch('/api/game-titles', {
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
    .then(gameTitles => {
      setGameTitles(gameTitles);
      setLoading(false);
      setError(false);
      gameTitles.forEach(gameTitle => dispatch(cacheGameTitle(gameTitle)));
    })
    .catch(() => {
      setLoading(false);
      setError(true);
      toast({
        title: t('error.fetch_fail_game_title'),
        status: 'error',
        isClosable: true,
      });
    });
  }, [authService, dispatch, t, toast]);

  useEffect(() => {
    loadGameTitles();
  }, [loadGameTitles]);

  if (loading) {
    return <GameTitlesTemplate>
      <Center><Spinner /></Center>
    </GameTitlesTemplate>;
  }

  if (error) {
    return <GameTitlesTemplate>
      <Center><ReloadButton onClick={loadGameTitles} /></Center>
    </GameTitlesTemplate>;
  }

  return <GameTitlesTemplate>
    <SimpleGrid columns={{base: 1, md: 2, lg: 2}} spacing={20}>
    {gameTitles.map(gameTitle => 
      <Center key={gameTitle.id}>
        <Link to={`/gacha/${gameTitle.slug}`}>
          <GameTitle {...gameTitle} />
        </Link>
      </Center>
    )}
    </SimpleGrid>
  </GameTitlesTemplate>;
};