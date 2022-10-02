import {
  Box,
  Flex,
  IconButton,
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
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

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
            <IconButton aria-label='previous' icon={<FiChevronLeft />} isDisabled={isPrevBtnDisabled} onClick={onPrevBtnClick} />
            <Spacer />
            <IconButton aria-label='previous' icon={<FiChevronRight />} isDisabled={isNextBtnDisabled} onClick={onNextBtnClick} />
          </Flex>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  </>;
};