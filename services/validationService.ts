export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationService {
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Please enter a valid email address');
    } else if (email.length > 254) {
      errors.push('Email address is too long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push('Password must contain at least one special character');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateApiKey(apiKey: string): ValidationResult {
    const errors: string[] = [];

    if (!apiKey) {
      errors.push('API key is required');
    } else if (!apiKey.startsWith('AIza')) {
      errors.push('API key must start with "AIza"');
    } else if (apiKey.length < 20) {
      errors.push('API key appears to be too short');
    } else if (!/^[A-Za-z0-9_-]+$/.test(apiKey)) {
      errors.push('API key contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validatePrompt(prompt: string): ValidationResult {
    const errors: string[] = [];

    if (!prompt) {
      errors.push('Prompt is required');
    } else if (prompt.length < 10) {
      errors.push('Prompt must be at least 10 characters long');
    } else if (prompt.length > 1000) {
      errors.push('Prompt must be less than 1000 characters');
    }

    // Check for potentially harmful content
    const harmfulPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    for (const pattern of harmfulPatterns) {
      if (pattern.test(prompt)) {
        errors.push('Prompt contains potentially harmful content');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateFileName(fileName: string): ValidationResult {
    const errors: string[] = [];

    if (!fileName) {
      errors.push('File name is required');
    } else {
      // Check for path traversal attempts
      if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
        errors.push('File name contains invalid characters');
      }

      // Check file extension
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const hasValidExtension = allowedExtensions.some(ext =>
        fileName.toLowerCase().endsWith(ext)
      );

      if (!hasValidExtension) {
        errors.push('File must be an image (JPG, PNG, GIF, or WebP)');
      }

      if (fileName.length > 255) {
        errors.push('File name is too long');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  static validateCampaignName(name: string): ValidationResult {
    const errors: string[] = [];

    if (!name) {
      errors.push('Campaign name is required');
    } else if (name.length < 3) {
      errors.push('Campaign name must be at least 3 characters long');
    } else if (name.length > 100) {
      errors.push('Campaign name must be less than 100 characters');
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
      errors.push('Campaign name contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUrl(url: string): ValidationResult {
    const errors: string[] = [];

    if (!url) {
      errors.push('URL is required');
    } else {
      try {
        const parsedUrl = new URL(url);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          errors.push('URL must use HTTP or HTTPS protocol');
        }
      } catch {
        errors.push('Please enter a valid URL');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const validationService = new ValidationService();