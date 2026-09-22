import { BadRequestException, Logger } from "@nestjs/common";
import axios from "axios";
import { ErrorMessages } from "src/common/enum/error-messages.enum";

export class FacebookFederation implements IFederation {
    public async tokenValidate(token: string): Promise<any> {
        try {
            const check = await axios.get(`${process.env.URL_FACEBOOK_TOKEN_VALIDATION}?fields=id,email,name,picture&access_token=${token}`);//obtain user info
            
            let { data } = check;

            if (!data.email) {
                throw new BadRequestException(ErrorMessages.FACEBOOK_EMAIL_NOT_AVAILABLE);
            }

            data = {
                email: data.email,
                full_name: data.name,
                sub: data.id,
                picture: data.picture?.data?.url ?? null,
            }

            return data;
        }catch(error){
            const logger = new Logger("FacebookFederation");
            logger.error(error);
            throw new BadRequestException(ErrorMessages.NOT_VALID_TOKEN);
        }
    }
}