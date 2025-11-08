/**
 * Environment Variable Validation Utility
 * 
 * Validates that all required environment variables are set before the application starts.
 * This helps catch configuration errors early rather than at runtime.
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

interface EnvVar {
  name: string;
  value: string | undefined;
  required: boolean;
  description: string;
  category: string;
}

const requiredEnvVars: EnvVar[] = [
  // Database
  {
    name: 'MONGODB_URI',
    value: process.env.MONGODB_URI,
    required: true,
    description: 'MongoDB connection string',
    category: 'Database',
  },
  
  // Authentication
  {
    name: 'NEXTAUTH_URL',
    value: process.env.NEXTAUTH_URL,
    required: true,
    description: 'NextAuth base URL',
    category: 'Authentication',
  },
  {
    name: 'NEXTAUTH_SECRET',
    value: process.env.NEXTAUTH_SECRET,
    required: true,
    description: 'NextAuth secret key (minimum 32 characters)',
    category: 'Authentication',
  },
  
  // Admin User
  {
    name: 'ADMIN_EMAIL',
    value: process.env.ADMIN_EMAIL,
    required: true,
    description: 'Admin user email',
    category: 'Admin',
  },
  {
    name: 'ADMIN_PASSWORD',
    value: process.env.ADMIN_PASSWORD,
    required: true,
    description: 'Admin user password',
    category: 'Admin',
  },
  {
    name: 'ADMIN_NAME',
    value: process.env.ADMIN_NAME,
    required: true,
    description: 'Admin user name',
    category: 'Admin',
  },
  
  // File Storage (R2/S3)
  {
    name: 'R2_ACCESS_KEY_ID',
    value: process.env.R2_ACCESS_KEY_ID,
    required: true,
    description: 'R2/S3 access key ID',
    category: 'Storage',
  },
  {
    name: 'R2_SECRET_ACCESS_KEY',
    value: process.env.R2_SECRET_ACCESS_KEY,
    required: true,
    description: 'R2/S3 secret access key',
    category: 'Storage',
  },
  {
    name: 'R2_ACCOUNT_ID',
    value: process.env.R2_ACCOUNT_ID,
    required: true,
    description: 'R2 account ID',
    category: 'Storage',
  },
  {
    name: 'R2_BUCKET_NAME',
    value: process.env.R2_BUCKET_NAME,
    required: true,
    description: 'R2/S3 bucket name',
    category: 'Storage',
  },
  {
    name: 'R2_PUBLIC_URL',
    value: process.env.R2_PUBLIC_URL,
    required: true,
    description: 'R2/S3 public URL',
    category: 'Storage',
  },
  
  // Application Configuration
  {
    name: 'NEXT_PUBLIC_URL',
    value: process.env.NEXT_PUBLIC_URL,
    required: true,
    description: 'Public-facing URL of the application',
    category: 'Application',
  },
  {
    name: 'NEXT_PUBLIC_API_URL',
    value: process.env.NEXT_PUBLIC_API_URL,
    required: true,
    description: 'Public-facing API URL',
    category: 'Application',
  },
  {
    name: 'NODE_ENV',
    value: process.env.NODE_ENV,
    required: true,
    description: 'Node environment (development, staging, production)',
    category: 'Application',
  },
];

/**
 * Validates that all required environment variables are set.
 * Throws an error with a list of missing variables if any are missing.
 * 
 * @throws {Error} If any required environment variables are missing
 */
export function validateRequiredEnvVars(): void {
  const missing: string[] = [];
  const categories: Record<string, string[]> = {};

  for (const envVar of requiredEnvVars) {
    if (envVar.required && !envVar.value) {
      missing.push(envVar.name);
      if (!categories[envVar.category]) {
        categories[envVar.category] = [];
      }
      categories[envVar.category].push(envVar.name);
    }
  }

  if (missing.length > 0) {
    const errorMessage = [
      'Missing required environment variables:',
      '',
      ...Object.entries(categories).map(([category, vars]) => {
        return `  ${category}:`;
      }).concat(
        ...Object.entries(categories).map(([category, vars]) => {
          return vars.map(v => `    - ${v}`).join('\n');
        })
      ),
      '',
      `Total missing: ${missing.length}`,
      '',
      'Please check your .env.local file and ensure all required variables are set.',
      'See .env.example for a complete list of required variables.',
    ].join('\n');

    throw new Error(errorMessage);
  }
}

/**
 * Validates environment variables and returns a report.
 * Does not throw an error, useful for validation scripts.
 * 
 * @returns Object with validation results
 */
export function validateEnvVarsReport(): {
  valid: boolean;
  missing: string[];
  categories: Record<string, string[]>;
  total: number;
  missingCount: number;
} {
  const missing: string[] = [];
  const categories: Record<string, string[]> = {};

  for (const envVar of requiredEnvVars) {
    if (envVar.required && !envVar.value) {
      missing.push(envVar.name);
      if (!categories[envVar.category]) {
        categories[envVar.category] = [];
      }
      categories[envVar.category].push(envVar.name);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    categories,
    total: requiredEnvVars.length,
    missingCount: missing.length,
  };
}

/**
 * Validates NEXTAUTH_SECRET meets minimum length requirement.
 * 
 * @throws {Error} If NEXTAUTH_SECRET is less than 32 characters
 */
export function validateNextAuthSecret(): void {
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret && secret.length < 32) {
    throw new Error(
      `NEXTAUTH_SECRET must be at least 32 characters long. Current length: ${secret.length}`
    );
  }
}

// Export default validation function
export default validateRequiredEnvVars;

