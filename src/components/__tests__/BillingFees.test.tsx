import { describe, it, expect } from 'vitest';
import { getListingFee } from '../../utils/paymentAndNotify';

describe('NestList Billing and Listing Fees Validation Tests', () => {
  it('should map Single Room properties to 100 KSh', () => {
    expect(getListingFee('Single Room', 0)).toBe(100);
    // Explicit bedroom fallback when bedroom count is 0
    expect(getListingFee('House', 0)).toBe(100);
  });

  it('should map Bedsitter properties to 200 KSh', () => {
    expect(getListingFee('Bedsitter', 0)).toBe(200);
    expect(getListingFee('Bedsitter', 1)).toBe(200);
  });

  it('should map Studio properties to 250 KSh', () => {
    expect(getListingFee('Studio', 0)).toBe(250);
  });

  it('should map 1 Bedroom properties to 500 KSh', () => {
    expect(getListingFee('House', 1)).toBe(500);
    expect(getListingFee('Apartment', 1)).toBe(500);
  });

  it('should map 2 Bedroom properties to 700 KSh', () => {
    expect(getListingFee('House', 2)).toBe(700);
    expect(getListingFee('Apartment', 2)).toBe(700);
  });

  it('should map 3 Bedroom properties to 1000 KSh', () => {
    expect(getListingFee('House', 3)).toBe(1000);
    expect(getListingFee('Apartment', 3)).toBe(1000);
  });

  it('should map 4 Bedroom properties to 1200 KSh', () => {
    expect(getListingFee('House', 4)).toBe(1200);
    expect(getListingFee('Apartment', 4)).toBe(1200);
  });

  it('should map 5+ Bedroom properties to 1500 KSh', () => {
    expect(getListingFee('House', 5)).toBe(1500);
    expect(getListingFee('House', 10)).toBe(1500);
  });
});
