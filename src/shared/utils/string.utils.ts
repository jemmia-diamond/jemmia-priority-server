import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

export class StringUtils {
  static random(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  static async encryptRsa(value: string, secret: string, salt: string) {
    const iv = randomBytes(16);

    const key = (await promisify(scrypt)(secret, salt, 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, iv);

    return {
      value: Buffer.concat([cipher.update(value), cipher.final()]).toString(),
      iv: iv.toString(),
    };
  }

  static async decryptRsa(
    value: string,
    secret: string,
    salt: string,
    iv: string,
  ) {
    const key = (await promisify(scrypt)(secret, salt, 32)) as Buffer;
    const decipher = createDecipheriv('aes-256-ctr', key, iv);

    return {
      value: Buffer.concat([
        decipher.update(Buffer.from(value)),
        decipher.final(),
      ]),
    };
  }
}
