module.exports = {
  ROLES: {
    CLIENT: 'Client',
    ADMIN: 'Admin',
  },
  AUTH_PROVIDERS: {
    LOCAL: 'local',
    GOOGLE: 'google',
  },
  MESSAGES: {
    REGISTRATION_SUCCESS:
      'Registration successful. Please check your email for your verification code.',
    VERIFICATION_SUCCESS: 'Email verified successfully. You can now log in.',
    OTP_SENT: 'If an account exists with this email, a verification code has been sent.',
    PASSWORD_RESET_SENT:
      'If an account exists with this email, a password reset code has been sent.',
    PASSWORD_RESET_SUCCESS: 'Password has been reset successfully. Please log in.',
    PASSWORD_CHANGED_SUCCESS: 'Password has been changed successfully.',
    LOGOUT_SUCCESS: 'Logged out successfully.',
    REFRESH_SUCCESS: 'Token refreshed successfully.',
  },
};
