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
  Badge,
  CloseButton,
  Spacer,
  Stack,
  Checkbox,
  Center,
  Tooltip,
  HStack,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export default function Item({
  id,
  name,
  shortName,
  tierName,
  imageUrl,
  ratio,
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
  emphasizeBorder,
  borderColor,
  children,
}) {
  const { t } = useTranslation();
  const itemNameTemplate = <>
    <HStack>
      <Tooltip label={name}>
        <Heading size='sm' noOfLines={1} wordBreak='break-word'>{shortName}</Heading>
      </Tooltip>
      <Center>
        <Badge>{tierName}</Badge>
      </Center>
    </HStack>
  </>;

  return (
    <Stack
      borderWidth={emphasizeBorder ? '2px' : '1px'} 
      borderColor={borderColor}
      borderRadius='lg' 
      boxShadow='lg'
      p={2}
    >
      <Stack>
        <Flex>
          {checkable ?
            <Checkbox isChecked={checked} onChange={checked ? onUncheck : onCheck}>
              {itemNameTemplate}
            </Checkbox>
            :
            itemNameTemplate
          }
          {closable &&
            <>
              <Spacer />
              <CloseButton onClick={onClose} />
            </>
          }
        </Flex>
        <AspectRatio 
          ratio={3 / 4} 
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
          >
            <NumberInputField  />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      }
      {children}
    </Stack>
  );
}