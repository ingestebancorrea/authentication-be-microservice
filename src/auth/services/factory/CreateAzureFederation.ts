import { AzureFederation } from "../federation/AzureFederation";
import { CreatorFactory } from "./CreatorFactory";

export class CreateAzureFederation extends CreatorFactory {
     
    public factoryFederation() {
       return new AzureFederation();
    }
    
}