import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { sendSuccess } from './responseHandler.js';

export const COOKIE_NAME = 'worknest_token';

/**
 * Generate signed JWT
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    ENV.JWT_SECRET,
    {
      expiresIn: ENV.JWT_EXPIRES_IN,
    }
  );
};

/**
 * Get cookie options based on environment
 */
export const getCookieOptions = () => {
  const isProduction = ENV.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
};

/**
 * Send token via HttpOnly cookie and return safe user data
 */
export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user);
  const cookieOptions = getCookieOptions();

  res.cookie(COOKIE_NAME, token, cookieOptions);

  return sendSuccess(res, statusCode, message, {
    user: user.toSafeObject ? user.toSafeObject() : user,
  });
};

/**
 * Clear authentication cookie
 */
export const clearTokenCookie = (res) => {
  const isProduction = ENV.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  });
};
