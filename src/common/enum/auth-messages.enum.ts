export enum AuthMessages {
  REGISTRATION_SUCCESS = 'Usuario registrado correctamente',
  REGISTRATION_CONFLICT = 'El usuario ya está registrado',
  USER_CREATED = 'Usuario creado correctamente',

  USER_ALREADY_REGISTERED = 'El usuario {username} ya está registrado',
  USER_ALREADY_REGISTERED_BY_EMAIL = 'Ya existe un usuario registrado con el email {email}',
  USER_NOT_FOUND_BY_EMAIL = 'El usuario {email} no existe',

  INVALID_CREDENTIALS = 'Credenciales inválidas',
  RECOVERY_REQUEST_ACCEPTED = 'Si el correo está registrado, te enviaremos las instrucciones para recuperar tu contraseña',
  PASSWORD_UPDATED = 'La contraseña se actualizó correctamente',

  PASSWORD_FORMAT_REQUIRED = 'La contraseña debe tener una mayúscula, una minúscula y un número',
  PASSWORD_CONFIRMATION_MISMATCH = 'La confirmación de contraseña no coincide con {property}',
  PHONE_FORMAT = 'El teléfono solo puede contener números, espacios y los signos + - ( )',
}