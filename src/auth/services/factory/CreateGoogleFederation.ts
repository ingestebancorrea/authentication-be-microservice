import { GoogleFederation } from "../federation/GoogleFederation";
import { CreatorFactory } from "./CreatorFactory";


export class CreateGoogleFederation extends CreatorFactory {
    
    public factoryFederation() {
        return new GoogleFederation();
    }

}