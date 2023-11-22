export type Props = {
  // comment 1
  // property_1: string;
  /* comment 2 */
  // property_2: string;
  /** comment 3 */
  property_3: string;
  /** @deprecated */
  property_4: string;
  /**
   * @depreceted
   * comment 5
   *  */
  property_5: string;
  /**
   * comment 6
   * @depreceted
   *  */
  property_6: string;
  /**
   * @depreceted
   * comment 7
   * @example
   *   let a = 1;
   *   let b = a + 2; // qwerty
   *  */
  property_7: string;
  /**
   * comment 8
   * @depreceted
   * @example
   *   let a = 1;
   *   let b = a + 2; // qwerty
   *  */
  property_8: string;
};
