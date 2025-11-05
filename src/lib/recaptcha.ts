// reCAPTCHA verification utility
export const verifyRecaptcha = async (token: string): Promise<boolean> => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  // Allow development placeholder token
  if (token === 'dev-placeholder-token') {
    console.warn('Development placeholder token detected. Allowing request.');
    return true;
  }
  
  if (!secretKey || secretKey === 'your_recaptcha_secret_key') {
    console.warn('reCAPTCHA secret key not configured');
    return true; // Allow requests if reCAPTCHA is not configured
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    return data.success === true && data.score >= 0.5; // reCAPTCHA v3 score threshold
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    // In development, allow requests if verification fails
    if (process.env.NODE_ENV === 'development') {
      console.warn('Allowing request in development mode despite reCAPTCHA verification failure');
      return true;
    }
    return false;
  }
};

// Verify human (alias for verifyRecaptcha)
export const verifyHuman = async (token: string): Promise<boolean> => {
  return verifyRecaptcha(token);
};

export default { verifyRecaptcha, verifyHuman };
