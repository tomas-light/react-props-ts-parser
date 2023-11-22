import path from 'path';
import { ParsedArray } from '../../types';
import { Props } from './Cache.props';
import { findPropertyByName } from './utils/findPropertyByName';
import { onceParsing } from './utils/onceParsing';

describe('Type Reference caching', () => {
  const filePath = path.join(__dirname, 'Cache.props.ts');

  const _parse = onceParsing(filePath);

  describe('super simple cases', () => {
    test('type alias on union: properties have same object reference', async () => {
      const result = await _parse();
      if (!result) {
        expect(result).not.toBeUndefined();
        return;
      }

      const property1 = findPropertyByName<Props>(result, 'cached1_1');
      const property2 = findPropertyByName<Props>(result, 'cached1_2');

      expect(property1).not.toBeUndefined();
      expect(property1?.value).toBe(property2?.value);
    });

    test('type alias on literal: properties have same object reference', async () => {
      const result = await _parse();
      if (!result) {
        expect(result).not.toBeUndefined();
        return;
      }

      const property1 = findPropertyByName<Props>(result, 'cached3_1');
      const property2 = findPropertyByName<Props>(result, 'cached3_2');

      expect(property1).not.toBeUndefined();
      expect(property1?.value).toBe(property2?.value);
    });

    test('interfaces: properties have same object reference', async () => {
      const result = await _parse();
      if (!result) {
        expect(result).not.toBeUndefined();
        return;
      }

      const property1 = findPropertyByName<Props>(result, 'cached2_1');
      const property2 = findPropertyByName<Props>(result, 'cached2_2');

      expect(property1).not.toBeUndefined();
      expect(property1?.value).toBe(property2?.value);
    });
  });

  describe('arrays', () => {
    test('array aliases', async () => {
      const result = await _parse();
      if (!result) {
        expect(result).not.toBeUndefined();
        return;
      }

      const property1 = findPropertyByName<Props>(result, 'cached4_1') as
        | ParsedArray
        | undefined;
      const property2 = findPropertyByName<Props>(result, 'cached4_2') as
        | ParsedArray
        | undefined;

      expect(property1).not.toBeUndefined();
      expect(property1?.value?.[0].value).toBe(property2?.value?.[0].value);
    });

    test('array interfaces', async () => {
      const result = await _parse();
      if (!result) {
        expect(result).not.toBeUndefined();
        return;
      }

      const property1 = findPropertyByName<Props>(result, 'cached8_1') as
        | ParsedArray
        | undefined;
      const property2 = findPropertyByName<Props>(result, 'cached8_2') as
        | ParsedArray
        | undefined;

      expect(property1).not.toBeUndefined();
      expect(property1?.value?.[0].value).toBe(property2?.value?.[0].value);
    });
  });

  describe('transformed types are not cached', () => {
    test('picked objects', async () => {
      const result = await _parse();
      if (!result) {
        expect(result).not.toBeUndefined();
        return;
      }

      const property1 = findPropertyByName<Props>(result, 'not_cached5_1');
      const property2 = findPropertyByName<Props>(result, 'not_cached5_2');

      expect(property1).not.toBeUndefined();
      expect(property2?.value).toBe(property1?.value);
    });

    test('omitted objects', async () => {
      const result = await _parse();
      if (!result) {
        expect(result).not.toBeUndefined();
        return;
      }

      const property1 = findPropertyByName<Props>(result, 'not_cached6_1');
      const property2 = findPropertyByName<Props>(result, 'not_cached6_2');

      expect(property1).not.toBeUndefined();
      expect(property2?.value).toBe(property1?.value);
    });

    test('partial objects', async () => {
      const result = await _parse();
      if (!result) {
        expect(result).not.toBeUndefined();
        return;
      }

      const property1 = findPropertyByName<Props>(result, 'not_cached7_1');
      const property2 = findPropertyByName<Props>(result, 'not_cached7_2');

      expect(property1).not.toBeUndefined();
      expect(property2?.value).toBe(property1?.value);
    });
  });
});
