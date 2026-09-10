import { CreateAzureFederation } from "./CreateAzureFederation";
import { CreateFacebookFederation } from "./CreateFacebookFedaration";
import { CreateGoogleFederation } from "./CreateGoogleFederation";

export const federationObjects = {
    "googleTokenValidation": new CreateGoogleFederation(),
    "azureTokenValidation": new CreateAzureFederation(),
    "facebookTokenValidation": new CreateFacebookFederation()
}