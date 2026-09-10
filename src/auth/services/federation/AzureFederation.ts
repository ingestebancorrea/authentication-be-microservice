import { BadRequestException, Logger } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { ErrorMessages } from "src/common/enum/error-messages.enum";

export class AzureFederation implements IFederation{
    public async tokenValidate(token: string): Promise<any> {
      const jwtService = new JwtService();

      type Payload = {
        tid : string,
        preferred_username: string,
        sub: string,
        name: string,
      }

      const { tid } = jwtService.decode(token) as Payload;

      const verify = (await import('azure-ad-verify-token')).verify;

      const ticket = await verify(token, {
        jwksUri: process.env.JWKS_URI,
        issuer: `https://login.microsoftonline.com/${tid}/v2.0`,
        audience: process.env.AZURE_CLIENT_ID,
      })
      .then(decoded => {
        // verified and decoded token
        const payload = decoded as Payload;

        const data = {
          email: payload.preferred_username,
          full_name: payload.name,
          sub: payload.sub,
          image: '',
        }

        return data;
      })
      .catch((error) => {
        // invalid token
        const logger = new Logger("AzureFederation");
        logger.error(error);
        throw new BadRequestException(ErrorMessages.NOT_VALID_TOKEN);
      });

      if(!ticket){
        return null;
      }
      return ticket;
    }
    
}