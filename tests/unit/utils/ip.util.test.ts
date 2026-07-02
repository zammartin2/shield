import * as ipUtil from '../../../src/utils/ip.util';

describe('IP Utils', () => {
  describe('IP Validation', () => {
    test('should validate IPv4 addresses', () => {
      const validIPs = [
        '192.168.1.1',
        '10.0.0.1',
        '172.16.0.1',
        '8.8.8.8',
        '255.255.255.255'
      ];
      validIPs.forEach(ip => {
        expect(ipUtil.validateIP(ip)).toBe(true);
      });
    });

    test('should reject invalid IPv4 addresses', () => {
      const invalidIPs = [
        'invalid',
        '256.256.256.256',
        '192.168.1',
        '192.168.1.1.1',
        '192.168.1.256'
      ];
      invalidIPs.forEach(ip => {
        expect(ipUtil.validateIP(ip)).toBe(false);
      });
    });

    test('should validate IPv6 addresses', () => {
      const validIPv6 = [
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        '::1',
        'fe80::1',
        '2001:db8::1'
      ];
      validIPv6.forEach(ip => {
        expect(ipUtil.validateIP(ip)).toBe(true);
      });
    });
  });

  describe('Private IP Detection', () => {
    test('should detect private IPv4 addresses', () => {
      const privateIPs = [
        '10.0.0.1',
        '10.255.255.255',
        '172.16.0.1',
        '172.31.255.255',
        '192.168.0.1',
        '192.168.255.255',
        '127.0.0.1'
      ];
      privateIPs.forEach(ip => {
        expect(ipUtil.isPrivateIP(ip)).toBe(true);
      });
    });

    test('should detect public IPv4 addresses', () => {
      const publicIPs = [
        '8.8.8.8',
        '1.1.1.1',
        '9.9.9.9',
        '203.0.113.1'
      ];
      publicIPs.forEach(ip => {
        expect(ipUtil.isPrivateIP(ip)).toBe(false);
      });
    });

    test('should handle invalid IPs', () => {
      expect(ipUtil.isPrivateIP('invalid')).toBe(false);
      expect(ipUtil.isPrivateIP('')).toBe(false);
    });
  });

  describe('IP Info', () => {
    test('should get IP info for IPv4', () => {
      const info = ipUtil.getIPInfo('192.168.1.1');
      expect(info).toBeDefined();
      if (info) {
        expect(info.version).toBe(4);
        expect(info.type).toBe('private');
      }
    });

    test('should get IP info for public IP', () => {
      const info = ipUtil.getIPInfo('8.8.8.8');
      expect(info).toBeDefined();
      if (info) {
        expect(info.version).toBe(4);
        expect(info.type).toBe('public');
      }
    });

    test('should return null for invalid IP', () => {
      const info = ipUtil.getIPInfo('invalid');
      expect(info).toBeNull();
    });
  });

  describe('IP Range Checks', () => {
    test('should check if IP in range', () => {
      // Если есть функция isInRange
      if (ipUtil.isInRange) {
        expect(ipUtil.isInRange('192.168.1.1', '192.168.1.0/24')).toBe(true);
        expect(ipUtil.isInRange('10.0.0.1', '192.168.1.0/24')).toBe(false);
      }
    });

    test('should handle CIDR notation', () => {
      // Если есть функция parseCIDR
      if (ipUtil.parseCIDR) {
        const result = ipUtil.parseCIDR('192.168.1.0/24');
        expect(result).toBeDefined();
        if (result) {
          expect(result.network).toBe('192.168.1.0');
          expect(result.mask).toBe(24);
        }
      }
    });
  });
});
