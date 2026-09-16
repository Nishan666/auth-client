// constants — yours to edit. Not overwritten by a package upgrade.

export const AUTH_SCREENS = {
  SIGN_IN: 'signin',
  SIGN_UP: 'signup',
  OTP: 'otp',
  FORGOT_PASSWORD: 'forgot-password',
  RESET_PASSWORD_OTP: 'reset-password-otp',
  RESET_PASSWORD: 'reset-password',
}

export const IDENTIFIER_TYPE = {
  EMAIL: 'email',
  PHONE: 'phone',
}

export const OTP_PURPOSE = {
  AUTH: 'auth',
  PASSWORD_RESET: 'password-reset',
}

export const OTP_LENGTH = 6

/** BroadcastChannel name — matches ORDO's so host and library share one bus. */
