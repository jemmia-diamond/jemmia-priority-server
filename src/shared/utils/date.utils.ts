export class DateUtils {
  static isBirthday(birthday: Date): boolean {
    const today = new Date();
    return (
      birthday.getDate() === today.getDate() &&
      birthday.getMonth() === today.getMonth()
    );
  }
}
