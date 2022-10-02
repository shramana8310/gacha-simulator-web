import { Alert, AlertIcon, ScaleFade, Stack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const AlertTemplate = ({children}) => {
  return <Alert status="error">
    <AlertIcon />
    {children}
  </Alert>;
}

export default function ValidationErrorAlerts({
  validationErrors,
  pageFilter,
  link,
}) {
  const validationErrorEntries = validationErrors.filter((validationError) => !pageFilter || validationError.page === pageFilter);
  if (validationErrorEntries.length === 0) {
    return;
  }
  return <Stack>
      {validationErrorEntries.map((validationError) => (link ? 
              <Link to={`../${validationError.page}`}><AlertTemplate>{validationError.message}</AlertTemplate></Link>
            : <AlertTemplate>{validationError.message}</AlertTemplate>))
        .map((validationErrorTemplate, i) => <ScaleFade in={true} initialScale={0.9} key={i}>{validationErrorTemplate}</ScaleFade>)}
    </Stack>;
};