import { Injectable } from '@nestjs/common';

@Injectable()
export class UsernameGeneratorService {
  private readonly MAX_USERNAME_LENGTH = 50; // Adjust as needed
  private readonly MAX_NAME_PART_LENGTH = 15; // Max length for each name part

  /**
   * Generate a clean username from components
   */
  generateUsername(
    name: string,
    collegeName: string,
    role: string,
    randomSuffix?: number
  ): string {
    // Clean and truncate each component
    const cleanName = this.cleanAndTruncateText(
      name,
      this.MAX_NAME_PART_LENGTH
    );
    const cleanCollegeName = this.cleanAndTruncateText(
      collegeName,
      this.MAX_NAME_PART_LENGTH
    );
    const cleanRole = this.cleanAndTruncateText(
      role,
      this.MAX_NAME_PART_LENGTH
    );

    // Build username components
    let username =
      `${cleanName}.${cleanCollegeName}.${cleanRole}`.toLowerCase();

    // Add random suffix if provided
    if (randomSuffix) {
      username += randomSuffix;
    }

    // Final truncation if still too long
    if (username.length > this.MAX_USERNAME_LENGTH) {
      username = username.substring(0, this.MAX_USERNAME_LENGTH);
      // Ensure it doesn't end with a dot
      username = username.replace(/\.$/, '');
    }

    return username;
  }

  /**
   * Extract college name from existing username
   */
  extractCollegeNameFromUsername(username: string): string {
    const parts = username.split('.');
    if (parts.length >= 2) {
      return parts[1];
    }
    return '';
  }

  /**
   * Clean text by removing spaces, special characters and truncating
   */
  public cleanAndTruncateText(text: string, maxLength: number): string {
    if (!text) return '';

    // Remove spaces and special characters, keep only alphanumeric
    let cleaned = text
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
      .toLowerCase();

    // Truncate if too long
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength);
    }

    return cleaned;
  }

  /**
   * Generate a random suffix for duplicate usernames
   */
  generateRandomSuffix(): number {
    return Math.floor(Math.random() * 9999) + 1;
  }

  /**
   * Validate username format
   */
  isValidUsername(username: string): boolean {
    // Check if username contains only allowed characters and is not too long
    const usernameRegex = /^[a-zA-Z0-9.]+$/;
    return (
      usernameRegex.test(username) &&
      username.length <= this.MAX_USERNAME_LENGTH &&
      !username.startsWith('.') &&
      !username.endsWith('.') &&
      !username.includes('..')
    );
  }
}
