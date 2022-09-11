import {
  Box,
  Button,
  Flex,
  Popover, 
  PopoverArrow, 
  PopoverBody, 
  PopoverCloseButton, 
  PopoverContent, 
  PopoverFooter, 
  PopoverHeader, 
  PopoverTrigger,
  Spacer,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function HelpPopover({
  isOpen,
  header,
  body,
  onCloseBtnClick,
  isPrevBtnDisabled,
  onPrevBtnClick,
  isNextBtnDisabled,
  onNextBtnClick,
  children,
}) {
  const { t } = useTranslation();
  return <>
    <Popover isOpen={isOpen}>
      <PopoverTrigger>
        <Box>{children}</Box>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton onClick={onCloseBtnClick} />
        <PopoverHeader>{header}</PopoverHeader>
        <PopoverBody>{body}</PopoverBody>
        <PopoverFooter>
          <Flex>
            <Button isDisabled={isPrevBtnDisabled} onClick={onPrevBtnClick}>{t('previous')}</Button>
            <Spacer />
            <Button isDisabled={isNextBtnDisabled} onClick={onNextBtnClick}>{t('next')}</Button>
          </Flex>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  </>;
};