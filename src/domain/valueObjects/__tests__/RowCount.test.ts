import { RowCount } from '../RowCount';

describe('RowCount', () => {
  describe('constructor', () => {
    it('should create RowCount with valid positive number', () => {
      const rowCount = new RowCount(100);
      expect(rowCount.value).toBe(100);
    });

    it('should create RowCount with zero', () => {
      const rowCount = new RowCount(0);
      expect(rowCount.value).toBe(0);
    });

    it('should create RowCount with null', () => {
      const rowCount = new RowCount(null);
      expect(rowCount.value).toBeNull();
    });

    it('should throw error for negative number', () => {
      expect(() => new RowCount(-1)).toThrow('Row count cannot be negative');
    });
  });

  describe('isLarge', () => {
    it('should return true for rows > 10000', () => {
      const rowCount = new RowCount(10001);
      expect(rowCount.isLarge()).toBe(true);
    });

    it('should return false for rows <= 10000', () => {
      const rowCount = new RowCount(10000);
      expect(rowCount.isLarge()).toBe(false);
    });

    it('should return false for null', () => {
      const rowCount = new RowCount(null);
      expect(rowCount.isLarge()).toBe(false);
    });
  });

  describe('isMedium', () => {
    it('should return true for rows between 1000 and 10000', () => {
      const rowCount = new RowCount(5000);
      expect(rowCount.isMedium()).toBe(true);
    });

    it('should return false for rows < 1000', () => {
      const rowCount = new RowCount(999);
      expect(rowCount.isMedium()).toBe(false);
    });

    it('should return false for rows > 10000', () => {
      const rowCount = new RowCount(10001);
      expect(rowCount.isMedium()).toBe(false);
    });
  });

  describe('isSmall', () => {
    it('should return true for rows < 1000', () => {
      const rowCount = new RowCount(999);
      expect(rowCount.isSmall()).toBe(true);
    });

    it('should return false for rows >= 1000', () => {
      const rowCount = new RowCount(1000);
      expect(rowCount.isSmall()).toBe(false);
    });
  });

  describe('multiply', () => {
    it('should multiply row counts correctly', () => {
      const rowCount1 = new RowCount(100);
      const rowCount2 = new RowCount(50);
      const result = rowCount1.multiply(rowCount2);
      expect(result.value).toBe(5000);
    });

    it('should return null if either is null', () => {
      const rowCount1 = new RowCount(100);
      const rowCount2 = new RowCount(null);
      const result = rowCount1.multiply(rowCount2);
      expect(result.value).toBeNull();
    });
  });
});
