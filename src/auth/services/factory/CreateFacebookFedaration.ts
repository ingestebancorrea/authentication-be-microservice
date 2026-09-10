import { FacebookFederation } from "../federation/FacebookFederation";
import { CreatorFactory } from "./CreatorFactory";

export class CreateFacebookFederation extends CreatorFactory {
    public factoryFederation() {
        return new FacebookFederation();
    }
    
}