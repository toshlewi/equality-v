// reCAPTCHA verification utility
export const verifyRecaptcha = async (token: string): Promise<boolean> => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
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
    return false;
  }
};

// Verify human (alias for verifyRecaptcha)
export const verifyHuman = async (token: string): Promise<boolean> => {
  return verifyRecaptcha(token);
};

export default { verifyRecaptcha, verifyHuman };
