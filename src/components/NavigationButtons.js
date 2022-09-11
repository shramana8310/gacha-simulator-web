import {
  Button, Flex, HStack, IconButton, Spacer,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { FiHelpCircle } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleShowHelp } from "../redux/gachaRequestFormSlice";

export default function NavigationButtons({
  prevBtnLink,
  nextBtnLink,
  prevBtnDisabled,
  nextBtnDisabled,
  nextBtnLabel,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  return <Flex>
    <Button 
      variant="outline" 
      isDisabled={prevBtnDisabled} 
      onClick={() => navigate(prevBtnLink)}
    >{t('back')}</Button>
    <Spacer />
    <HStack>
      <Button colorScheme="blue" isDisabled={nextBtnDisabled} onClick={() => navigate(nextBtnLink)}>{nextBtnLabel ? nextBtnLabel : t('proceed')}</Button>
      <IconButton variant="ghost" aria-label={t('help')} icon={<FiHelpCircle />} onClick={() => dispatch(toggleShowHelp())}></IconButton>
    </HStack>
    <Spacer />
  </Flex>;
};