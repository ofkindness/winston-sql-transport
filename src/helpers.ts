/*
 * @module 'helpers'
 * @fileoverview Winston transport helpers
 * @license MIT
 * @author Andrei Tretyakov <andrei.tretyakov@gmail.com>
 */
export const handleCallback = (
  callback: (...args: any) => void,
  ...args: any
) => {
  if (callback && typeof callback === 'function') {
    callback(...args);
  }
};
