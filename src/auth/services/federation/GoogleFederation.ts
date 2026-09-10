import { BadRequestException, Logger } from "@nestjs/common";
import { OAuth2Client } from "google-auth-library";
import { ErrorMessages } from "src/common/enum/error-messages.enum";

export class GoogleFederation implements IFederation {
    
    public async tokenValidate(token: string): Promise<any> {
        try{
            const client = new OAuth2Client(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_SECRET,
            );
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            // console.log(ticket.getPayload());
            if(!ticket){
                return null
            }
            return {
                email: ticket.getPayload().email,
                full_name: ticket.getPayload().name,
                sub: ticket.getPayload().sub,
                picture: ticket.getPayload().picture
            }
        }
        catch(error){
            const logger = new Logger("GoogleFederation");
            logger.error(error);
            throw new BadRequestException(ErrorMessages.NOT_VALID_TOKEN);
        }
    }
}