import { Button, Flex, Spacer } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { FiChevronLeft, FiChevronRight, FiChevronsRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export const NavigationButtonTemplate = ({
  prevBtnLink,
  prevBtnDisabled,
  nextBtnLink,
  nextBtnDisabled,
  children,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Flex>
      <Button 
        variant="ghost" 
        isDisabled={prevBtnDisabled} 
        onClick={() => navigate(prevBtnLink)}
        leftIcon={<FiChevronLeft />}
      >{t('previous')}</Button>
      <Spacer />
      {children}
      <Spacer />
      <Button 
        variant="ghost" 
        isDisabled={nextBtnDisabled} 
        onClick={() => navigate(nextBtnLink)}
        rightIcon={<FiChevronRight />}
      >{t('next')}</Button>
    </Flex>
  );
};

export default function NavigationButtons({
  prevBtnLink,
  nextBtnLink,
  prevBtnDisabled,
  nextBtnDisabled,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <NavigationButtonTemplate
      prevBtnLink={prevBtnLink}
      nextBtnLink={nextBtnLink}
      prevBtnDisabled={prevBtnDisabled}
      nextBtnDisabled={nextBtnDisabled}
    >
      <Button
        colorScheme="blue"
        onClick={() => navigate("../review")}
        rightIcon={<FiChevronsRight />}
      >{t('review')}</Button>
    </NavigationButtonTemplate>
  );
};