import React from "react";
import {
  Flex,
  Heading,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Image,
  AspectRatio,
  CloseButton,
  Spacer,
  Stack,
  Checkbox,
  HStack,
  Badge,
  Center,
} from '@chakra-ui/react';
import { useTranslation } from "react-i18next";

export default function Tier({
  name,
  shortName,
  ratio,
  imageUrl,
  number,
  checkable,
  checked,
  onCheck,
  onUncheck,
  closable,
  onClose,
  ratioEditable,
  onRatioChange,
  ratioMin,
  ratioMax,
  numberEditable,
  onNumberChange,
  numberMin,
  numberMax,
}) {
  const { t } = useTranslation();

  const tierNameTemplate = <>
    <HStack>
      <Heading size='sm' noOfLines={1} wordBreak='break-word'>{name}</Heading>
      <Center>
        <Badge>{shortName}</Badge>
      </Center>
    </HStack>
  </>;

  return (
    <Stack
      borderWidth='1px' 
      borderRadius='lg' 
      boxShadow='lg'
      p={2} 
    >
      <Stack onClick={checked ? onUncheck : onCheck}>
        <Flex>
          {checkable ?
            <Checkbox isChecked={checked} onChange={checked ? onUncheck : onCheck}>
              {tierNameTemplate}
            </Checkbox>
            :
            tierNameTemplate
          }
          {closable && 
            <>
              <Spacer />
              <CloseButton onClick={onClose} />
            </>
          }
        </Flex>
        <AspectRatio
          ratio={4 / 3} 
          onClick={checked ? onUncheck : onCheck} 
          _hover={{cursor: checkable ? 'pointer' : undefined}}
        >
          <Image src={imageUrl} loading='lazy' />
        </AspectRatio>
      </Stack>
      {ratioEditable && 
        <FormControl>
          <FormLabel>{t('ratio')}</FormLabel>
          <NumberInput 
            value={ratio} 
            onChange={onRatioChange} 
            min={ratioMin} 
            max={ratioMax}
            allowMouseWheel={true}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      }
      {numberEditable && 
        <FormControl>
          <FormLabel>{t('number')}</FormLabel>
          <NumberInput 
            value={number} 
            onChange={onNumberChange} 
            min={numberMin} 
            max={numberMax}
            allowMouseWheel={true}
          >
            <NumberInputField  />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      }
    </Stack>
  );
}