import {
  isValidIP,
  isIPv6,
  getIPInfo,
  getNetworkAddress,
  getBroadcastAddress,
  getHostCount,
  ipToNumber
} from '../../../src/utils/ip.util';

describe('IP Utils - Extra Coverage', () => {
  // ============================================
  // isValidIP — compressed / edge IPv6 forms
  // ============================================

  describe('isValidIP - compressed IPv6 edge forms', () => {
    it('should accept ::-prefixed compressed IPv6 with multiple groups', () => {
      expect(isValidIP('::1:2')).toBe(true);
      expect(isValidIP('::abcd')).toBe(true);
      expect(isValidIP('::dead:beef')).toBe(true);
    });

    it('should reject compressed IPv6 whose groups exceed 8', () => {
      expect(isValidIP('::a:b:c:d:e:f:1:2:3')).toBe(false);
    });

    it('should reject IPv4-mapped IPv6 ::ffff: form with valid octets', () => {
      expect(isValidIP('::ffff:192.0.2.1')).toBe(false);
    });

    it('should reject IPv4-mapped IPv6 ::ffff: form with out-of-range octets', () => {
      expect(isValidIP('::ffff:999.0.2.1')).toBe(false);
    });

    it('should reject embedded IPv4 :: form with valid octets', () => {
      expect(isValidIP('::192.0.2.1')).toBe(false);
    });

    it('should reject embedded IPv4 :: form with out-of-range octets', () => {
      expect(isValidIP('::999.0.2.1')).toBe(false);
    });

    it('should accept trailing-:: shape via the trailing-:: branch', () => {
      expect(isValidIP('2001:::')).toBe(true);
      expect(isValidIP('fe80:::')).toBe(true);
    });

    it('should reject trailing-:: form 2001:db8:: (regex needs an extra colon)', () => {
      expect(isValidIP('2001:db8::')).toBe(false);
      expect(isValidIP('fe80::')).toBe(false);
    });
  });

  // ============================================
  // getIPInfo — classification
  // ============================================

  describe('getIPInfo - classification', () => {
    it('should classify a public IPv6 address', () => {
      expect(getIPInfo('2001:::')).toEqual({
        version: 6,
        type: 'public',
        isPrivate: false,
        isLocal: false,
        isPublic: true,
        isValid: true
      });
    });

    it('should return null for an address rejected by isValidIP', () => {
      expect(getIPInfo('2001:db8::')).toBeNull();
      expect(getIPInfo('fe80::')).toBeNull();
    });
  });

  // ============================================
  // isIPv6 — the second validator
  // ============================================

  describe('isIPv6 - compressed edge forms', () => {
    it('should accept ::-prefixed compressed IPv6 with multiple groups', () => {
      expect(isIPv6('::1:2')).toBe(true);
      expect(isIPv6('::dead:beef')).toBe(true);
    });

    it('should accept trailing-:: shape via the trailing-:: branch', () => {
      expect(isIPv6('2001:::')).toBe(true);
      expect(isIPv6('fe80:::')).toBe(true);
    });

    it('should reject trailing-:: form 2001:db8:: (regex needs an extra colon)', () => {
      expect(isIPv6('2001:db8::')).toBe(false);
      expect(isIPv6('fe80::')).toBe(false);
    });

    it('should reject embedded IPv4 :: form', () => {
      expect(isIPv6('::192.0.2.1')).toBe(false);
      expect(isIPv6('::999.0.2.1')).toBe(false);
    });

    it('should reject IPv4-mapped ::ffff: form', () => {
      expect(isIPv6('::ffff:192.0.2.1')).toBe(false);
      expect(isIPv6('::ffff:999.0.2.1')).toBe(false);
    });
  });

  // ============================================
  // getNetworkAddress
  // ============================================

  describe('getNetworkAddress', () => {
    it('should compute the network address for a /16 mask', () => {
      expect(getNetworkAddress('10.20.30.40', '255.255.0.0')).toBe('10.20.0.0');
    });

    it('should compute the network address for a /8 mask', () => {
      expect(getNetworkAddress('10.20.30.40', '255.0.0.0')).toBe('10.0.0.0');
    });

    it('should compute the network address for a /24 mask', () => {
      expect(getNetworkAddress('111.2.3.4', '255.255.255.0')).toBe('111.2.3.0');
    });

    it('should return the address itself for a /32 mask', () => {
      expect(getNetworkAddress('10.20.30.40', '255.255.255.255')).toBe('10.20.30.40');
    });

    it('should throw when the masked network has the high bit set', () => {
      expect(() => getNetworkAddress('192.168.1.10', '255.255.255.0')).toThrow(
        'Number out of valid IPv4 range'
      );
      expect(() => getNetworkAddress('128.0.0.5', '255.255.255.0')).toThrow(
        'Number out of valid IPv4 range'
      );
    });
  });

  // ============================================
  // getBroadcastAddress
  // ============================================

  describe('getBroadcastAddress', () => {
    it('should compute the broadcast address for a /16 mask', () => {
      expect(getBroadcastAddress('10.20.30.40', '255.255.0.0')).toBe('10.20.255.255');
    });

    it('should compute the broadcast address for a /8 mask', () => {
      expect(getBroadcastAddress('10.20.30.40', '255.0.0.0')).toBe('10.255.255.255');
    });

    it('should compute the broadcast address for a /24 mask', () => {
      expect(getBroadcastAddress('111.2.3.4', '255.255.255.0')).toBe('111.2.3.255');
    });

    it('should return the address itself for a /32 mask', () => {
      expect(getBroadcastAddress('10.20.30.40', '255.255.255.255')).toBe('10.20.30.40');
    });

    it('should throw when the broadcast has the high bit set', () => {
      expect(() => getBroadcastAddress('192.168.1.10', '255.255.255.0')).toThrow(
        'Number out of valid IPv4 range'
      );
    });
  });

  // ============================================
  // network ↔ broadcast span vs host count
  // ============================================

  describe('network and broadcast span', () => {
    it('should span exactly getHostCount(16) hosts between network and broadcast', () => {
      const network = ipToNumber(getNetworkAddress('10.20.30.40', '255.255.0.0'));
      const broadcast = ipToNumber(getBroadcastAddress('10.20.30.40', '255.255.0.0'));
      expect(broadcast - network - 1).toBe(getHostCount(16));
    });

    it('should span exactly getHostCount(8) hosts between network and broadcast', () => {
      const network = ipToNumber(getNetworkAddress('10.20.30.40', '255.0.0.0'));
      const broadcast = ipToNumber(getBroadcastAddress('10.20.30.40', '255.0.0.0'));
      expect(broadcast - network - 1).toBe(getHostCount(8));
    });
  });
});
