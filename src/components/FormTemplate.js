import { 
  Heading, 
  Stack, 
} from '@chakra-ui/react'

export default function FormTemplate({title, children}) {
  return (
    <Stack spacing={5}>
      <Heading size="lg">{title}</Heading>
      {children}
    </Stack>
  );
}
