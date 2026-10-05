import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { AuthMessages } from '../enum/auth-messages.enum';
import { formatMessage } from '../utils/format-message.util';

@ValidatorConstraint({ name: 'passwordMatch', async: false })
export class PasswordMatchValidator implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments): boolean {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
        return typeof value === 'string' && value === relatedValue;
    }

    defaultMessage(): string {
        return formatMessage(AuthMessages.PASSWORD_CONFIRMATION_MISMATCH, {
            property: 'la contraseña',
        });
    }
}

export function PasswordMatch(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string): void {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: ['password'],
            validator: PasswordMatchValidator,
        });
    };
}