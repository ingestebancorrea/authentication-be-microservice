export abstract class CreatorFactory {
    public abstract factoryFederation():any;
    
    public async checkToken(token:string):Promise<any>{
        const validate =  this.factoryFederation();//AzureFederation return factoryValidation
        return await validate.tokenValidate(token);
    }
}