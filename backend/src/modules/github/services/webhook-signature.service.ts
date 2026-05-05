import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Service for verifying GitHub webhook signatures using HMAC-SHA256
 */
@Injectable()
export class WebhookSignatureService {
  private readonly algorithm = 'sha256';
  private readonly signaturePrefix = 'sha256=';

  /**
   * Verify GitHub webhook signature using HMAC-SHA256
   *
   * @param payload - Raw request body as string or Buffer
   * @param signature - GitHub signature header (X-Hub-Signature-256)
   * @param secret - Webhook secret configured for the repository
   * @returns true if signature is valid, false otherwise
   *
   */
  verifySignature(payload: string | Buffer, signature: string, secret: string): boolean {
    if (!payload || !signature || !secret) {
      return false;
    }

    // GitHub signature format: sha256=<hex_digest>
    if (!signature.startsWith(this.signaturePrefix)) {
      return false;
    }

    const expectedSignature = signature.slice(this.signaturePrefix.length);

    // Compute HMAC-SHA256 of the payload
    const computedSignature = this.computeSignature(payload, secret);

    // Use timing-safe comparison to prevent timing attacks
    return this.safeCompare(expectedSignature, computedSignature);
  }

  /**
   * Compute HMAC-SHA256 signature for a payload
   *
   * @param payload - Raw request body
   * @param secret - Webhook secret
   * @returns Hex-encoded signature
   */
  computeSignature(payload: string | Buffer, secret: string): string {
    const hmac = createHmac(this.algorithm, secret);
    hmac.update(payload);
    return hmac.digest('hex');
  }

  /**
   * Timing-safe string comparison to prevent timing attacks
   *
   * @param a - First string
   * @param b - Second string
   * @returns true if strings are equal
   */
  private safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    const bufferA = Buffer.from(a, 'hex');
    const bufferB = Buffer.from(b, 'hex');

    if (bufferA.length !== bufferB.length) {
      return false;
    }

    return timingSafeEqual(bufferA, bufferB);
  }
}
