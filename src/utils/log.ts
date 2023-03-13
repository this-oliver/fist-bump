import { PACKAGE_NAME } from "../config";

type LogType = "error" | "warn";
/**
 * Logs a message to the console and returns the message
 * 
 * @param message - message to log
 * @param logType - type of log message
 * @returns string
 */
export function logMessage(message: string, logType?: LogType): string {
  let msg: string;

  if (logType === "error") {
    msg = `[${PACKAGE_NAME}] ❗️ ${message}`
  } else if (logType === "warn") {
    msg = `[${PACKAGE_NAME}] ⚠️ ${message}`
  } else {
    msg = `[${PACKAGE_NAME}] 👊 ${message}`
  }

  console.log(msg);

  return msg;
}