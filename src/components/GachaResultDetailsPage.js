import { Container, Stack } from "@chakra-ui/react";
import GachaResultDetails from "./GachaResultDetails";

export default function GachaResultDetailsPage() {
  return <Container maxW={'6xl'} p={5}>
    <Stack spacing={20}>
      <GachaResultDetails showPublicOnly={true} />
    </Stack>
  </Container>;
}