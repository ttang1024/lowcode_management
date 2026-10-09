/**
 * @module GeneralResult
 * @description Unified API result
 */
import BusinessEnum from '../enums/BusinessEnum';

interface ErrorCode {
  code: string | number
  message: string
}

/** Return data */
export default class GeneralResult<T = any> {
  /**
   * Returned: business code
   */
  public errorCode: BusinessEnum;

  /**
   * Returned message
   */
  public errorMsg?: string;

  /**
   * Returned data
   */
  public result: T;

  /** whether the current operation succeeded */
  public success: boolean;

  public asyncKey?: string;

  /**
   * Return a result representing success
   * @param data Result
   */
  static success(data: any) {
    return new GeneralResult(BusinessEnum.SUCCESS, data);
  }

  /**
   * Return an interface representing an error
   * @param code may be an error object or an error code
   * @param message Custom error message
   */
  static fail(code: number | BusinessEnum | ErrorCode | Error, message?: string) {
    const errorCode = code as any;
    if (code instanceof Error || (errorCode && errorCode.code)) {
      // if the passed-incodeis an error object, parse iterrorbuild it
      const data = code as any;
      const errorCode = 'code' in data ? data.code : BusinessEnum.ERROR;
      return new GeneralResult(errorCode, null, data.message);
    }
    return new GeneralResult(code as any, null, message);
  }

  /**
   * Construct a unified result instance
   * @param code Result code
   * @param data Return data
   * @param message Returned message
   */
  constructor(code: BusinessEnum, data?: any, message?: string) {
    this.errorCode = code;
    this.errorMsg = message;
    this.result = data;
    this.success = code == 0;
  }
}