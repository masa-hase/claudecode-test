import { AccessType } from '../AccessType';

describe('AccessType', () => {
  describe('constructor', () => {
    it('should create AccessType for ALL', () => {
      const accessType = new AccessType('ALL');
      expect(accessType.value).toBe('ALL');
    });

    it('should create AccessType for index', () => {
      const accessType = new AccessType('index');
      expect(accessType.value).toBe('index');
    });

    it('should create AccessType for range', () => {
      const accessType = new AccessType('range');
      expect(accessType.value).toBe('range');
    });

    it('should create AccessType for ref', () => {
      const accessType = new AccessType('ref');
      expect(accessType.value).toBe('ref');
    });

    it('should create AccessType for eq_ref', () => {
      const accessType = new AccessType('eq_ref');
      expect(accessType.value).toBe('eq_ref');
    });

    it('should create AccessType for const', () => {
      const accessType = new AccessType('const');
      expect(accessType.value).toBe('const');
    });

    it('should create AccessType for system', () => {
      const accessType = new AccessType('system');
      expect(accessType.value).toBe('system');
    });

    it('should create AccessType for NULL', () => {
      const accessType = new AccessType(null);
      expect(accessType.value).toBeNull();
    });
  });

  describe('isFullTableScan', () => {
    it('should return true for ALL', () => {
      const accessType = new AccessType('ALL');
      expect(accessType.isFullTableScan()).toBe(true);
    });

    it('should return false for index access', () => {
      const accessType = new AccessType('index');
      expect(accessType.isFullTableScan()).toBe(false);
    });
  });

  describe('isIndexScan', () => {
    it('should return true for index', () => {
      const accessType = new AccessType('index');
      expect(accessType.isIndexScan()).toBe(true);
    });

    it('should return false for ALL', () => {
      const accessType = new AccessType('ALL');
      expect(accessType.isIndexScan()).toBe(false);
    });
  });

  describe('isOptimal', () => {
    it('should return true for const', () => {
      const accessType = new AccessType('const');
      expect(accessType.isOptimal()).toBe(true);
    });

    it('should return true for system', () => {
      const accessType = new AccessType('system');
      expect(accessType.isOptimal()).toBe(true);
    });

    it('should return true for eq_ref', () => {
      const accessType = new AccessType('eq_ref');
      expect(accessType.isOptimal()).toBe(true);
    });

    it('should return false for ALL', () => {
      const accessType = new AccessType('ALL');
      expect(accessType.isOptimal()).toBe(false);
    });
  });

  describe('getPerformanceScore', () => {
    it('should return 10 for system', () => {
      const accessType = new AccessType('system');
      expect(accessType.getPerformanceScore()).toBe(10);
    });

    it('should return 9 for const', () => {
      const accessType = new AccessType('const');
      expect(accessType.getPerformanceScore()).toBe(9);
    });

    it('should return 1 for ALL', () => {
      const accessType = new AccessType('ALL');
      expect(accessType.getPerformanceScore()).toBe(1);
    });

    it('should return 0 for null', () => {
      const accessType = new AccessType(null);
      expect(accessType.getPerformanceScore()).toBe(0);
    });
  });
});
