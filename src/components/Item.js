import {
  Flex,
  Heading,
  Image,
  AspectRatio,
  Badge,
  CloseButton,
  Spacer,
  Stack,
  Center,
  HStack,
  Text,
} from '@chakra-ui/react';
import ConditionalCheckbox from './ConditionalCheckbox';

export default function Item({
  item = {
    id: undefined,
    name: undefined,
    shortName: undefined,
    ratio: undefined,
    imageUrl: undefined,
    tier: {
      shortName: undefined,
    },
  },
  checkable,
  checked,
  onCheck,
  onUncheck,
  closable,
  onClose,
  emphasizeBorder,
  borderColor,
  children,
}) {
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
          <ConditionalCheckbox checkable={checkable} checked={checked} onCheck={onCheck} onUncheck={onUncheck}>
            <HStack>
              <Heading size='sm' noOfLines={1} wordBreak='break-word'>{item.shortName}</Heading>
              <Center>
                <Badge>{item.tier.shortName}</Badge>
              </Center>
            </HStack>
          </ConditionalCheckbox>
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
          <Image src={item.imageUrl} loading='lazy' />
        </AspectRatio>
        <Text fontSize='sm'>{item.name}</Text>
      </Stack>
      {children}
    </Stack>
  );
}