import { MINUTE_TO_SECOND, SECOND_TO_MILLISECOND } from "/utils/Constants.js";

export const API_ROOT = "/file-drop/api";
export const TIMEOUT_MS =
    // eslint-disable-next-line no-magic-numbers
    30 * MINUTE_TO_SECOND * SECOND_TO_MILLISECOND;
