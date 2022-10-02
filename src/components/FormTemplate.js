import { 
  Flex,
  Heading, 
  HStack, 
  IconButton, 
  Spacer, 
  Stack, 
} from '@chakra-ui/react'
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiHelpCircle } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { toggleShowHelp } from '../utils/gachaRequestFormSlice';

export default function FormTemplate({title, menu, children, showHelpIcon}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  return (
    <Stack spacing={5}>
      <Flex align='center'>
        <HStack>
          <Heading size="lg">{title}</Heading>
          {showHelpIcon && <IconButton variant="ghost" aria-label={t('help')} icon={<FiHelpCircle />} onClick={() => dispatch(toggleShowHelp())} />}
        </HStack>
        <Spacer />
        {menu}
      </Flex>
      {children}
    </Stack>
  );
}

export const FormTemplateWrapper = forwardRef((props, ref) => {
  return <div ref={ref}><FormTemplate {...props}>{props.children}</FormTemplate></div>;
});
