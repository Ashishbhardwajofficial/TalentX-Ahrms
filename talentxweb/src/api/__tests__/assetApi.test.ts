import { AssetApiClientImpl } from '../assetApi';
import { AssetType, AssetStatus } from '../../types';

describe('AssetApiClient', () => {
  let client: AssetApiClientImpl;

  beforeEach(() => {
    client = new AssetApiClientImpl();
  });

  describe('buildQueryParams', () => {
    it('should build query params correctly', () => {
      const params = {
        page: 0,
        size: 10,
        organizationId: 1,
        assetType: AssetType.LAPTOP,
        status: AssetStatus.AVAILABLE,
        search: 'test'
      };

      const result = client['buildQueryParams'](params);

      expect(result).toContain('page=0');
      expect(result).toContain('size=10');
      expect(result).toContain('organizationId=1');
      expect(result).toContain('assetType=LAPTOP');
      expect(result).toContain('status=AVAILABLE');
      expect(result).toContain('search=test');
    });

    it('should exclude undefined and null values', () => {
      const params = {
        page: 0,
        size: 10,
        organizationId: undefined,
        assetType: null,
        search: ''
      };

      const result = client['buildQueryParams'](params);

      expect(result).toContain('page=0');
      expect(result).toContain('size=10');
      expect(result).not.toContain('organizationId');
      expect(result).not.toContain('assetType');
      expect(result).not.toContain('search');
    });
  });

  describe('endpoints', () => {
    it('should have correct endpoint constants', () => {
      const endpoints = client['ENDPOINTS'];

      expect(endpoints.BASE).toBe('/assets');
      expect(endpoints.BY_ID(123)).toBe('/assets/123');
      expect(endpoints.ASSIGN).toBe('/assets/assign');
      expect(endpoints.RETURN(456)).toBe('/assets/456/return');
      expect(endpoints.ASSIGNMENTS(789)).toBe('/assets/789/assignments');
      expect(endpoints.EMPLOYEE_ASSETS(101)).toBe('/assets/employee/101');
      expect(endpoints.ASSET_HISTORY(202)).toBe('/assets/202/history');
    });
  });
});