import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'passwordMatch', async: false })
export class PasswordMatchValidator implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments): boolean {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
        return typeof value === 'string' && value === relatedValue;
    }

    defaultMessage(args: ValidationArguments): string {
        const [relatedPropertyName] = args.constraints;
        return `La confirmación de contraseña no coincide con ${relatedPropertyName}`;
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