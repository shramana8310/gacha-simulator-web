import React from "react";
import {
  Flex,
  Heading,
  Image,
  AspectRatio,
  CloseButton,
  Spacer,
  Stack,
  HStack,
  Badge,
  Center,
} from '@chakra-ui/react';
import ConditionalCheckbox from "./ConditionalCheckbox";

export default function Tier({
  tier = {
    id: undefined,
    ratio: undefined,
    imageUrl: undefined,
    name: undefined,
    shortName: undefined,
  },
  checkable,
  checked,
  onCheck,
  onUncheck,
  closable,
  onClose,
  children,
}) {

  return (
    <Stack
      borderWidth='1px' 
      borderRadius='lg' 
      boxShadow='lg'
      p={2} 
    >
      <Stack onClick={checked ? onUncheck : onCheck}>
        <Flex>
          <ConditionalCheckbox checkable={checkable} checked={checked} onCheck={onCheck} onUncheck={onUncheck}>
            <HStack>
              <Heading size='sm' noOfLines={1} wordBreak='break-word'>{tier.name}</Heading>
              <Center>
                <Badge>{tier.shortName}</Badge>
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
          ratio={4 / 3} 
          onClick={checked ? onUncheck : onCheck} 
          _hover={{cursor: checkable ? 'pointer' : undefined}}
        >
          <Image src={tier.imageUrl} loading='lazy' />
        </AspectRatio>
      </Stack>
      {children}
    </Stack>
  );
}