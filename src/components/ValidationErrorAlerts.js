import { Alert, AlertIcon, ScaleFade, Stack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function ValidationErrorAlerts({
  validationErrors,
  pageFilter,
  link,
}) {
  return validationErrors.length > 0 && 
    <Stack>
      {validationErrors
        .filter((validationError) => !pageFilter || validationError.page === pageFilter)
        .map((validationError) => {
          const alertTemplate = <Alert status="error">
            <AlertIcon />
            {validationError.message}
          </Alert>;
          return link ? 
              <Link to={`../${validationError.page}`}>{alertTemplate}</Link>
            : alertTemplate;
        })
        .map((validationErrorTemplate, i) => <ScaleFade in={true} initialScale={0.9} key={i}>{validationErrorTemplate}</ScaleFade>)}
    </Stack>;
};