import { QueryType } from '../QueryType';

describe('QueryType', () => {
  describe('constructor', () => {
    it('should create a valid QueryType for SIMPLE', () => {
      const queryType = new QueryType('SIMPLE');
      expect(queryType.value).toBe('SIMPLE');
    });

    it('should create a valid QueryType for PRIMARY', () => {
      const queryType = new QueryType('PRIMARY');
      expect(queryType.value).toBe('PRIMARY');
    });

    it('should create a valid QueryType for SUBQUERY', () => {
      const queryType = new QueryType('SUBQUERY');
      expect(queryType.value).toBe('SUBQUERY');
    });

    it('should create a valid QueryType for DERIVED', () => {
      const queryType = new QueryType('DERIVED');
      expect(queryType.value).toBe('DERIVED');
    });

    it('should create a valid QueryType for UNION', () => {
      const queryType = new QueryType('UNION');
      expect(queryType.value).toBe('UNION');
    });

    it('should throw error for invalid query type', () => {
      expect(() => new QueryType('INVALID')).toThrow('Invalid query type: INVALID');
    });
  });

  describe('isSimple', () => {
    it('should return true for SIMPLE query type', () => {
      const queryType = new QueryType('SIMPLE');
      expect(queryType.isSimple()).toBe(true);
    });

    it('should return false for non-SIMPLE query type', () => {
      const queryType = new QueryType('PRIMARY');
      expect(queryType.isSimple()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for equal query types', () => {
      const queryType1 = new QueryType('SIMPLE');
      const queryType2 = new QueryType('SIMPLE');
      expect(queryType1.equals(queryType2)).toBe(true);
    });

    it('should return false for different query types', () => {
      const queryType1 = new QueryType('SIMPLE');
      const queryType2 = new QueryType('PRIMARY');
      expect(queryType1.equals(queryType2)).toBe(false);
    });
  });
});
