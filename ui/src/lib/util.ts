export function dateToDa(d: Date, mil = false) {
    const fil = function (n: number) {
      return n >= 10 ? n : '0' + n;
    };
    return (
      `~${d.getUTCFullYear()}.` +
      `${d.getUTCMonth() + 1}.` +
      `${fil(d.getUTCDate())}..` +
      `${fil(d.getUTCHours())}.` +
      `${fil(d.getUTCMinutes())}.` +
      `${fil(d.getUTCSeconds())}` +
      `${mil ? '..0000' : ''}`
    );
  }

  export function deSig(ship: string): string {
    if (!ship) {
      return '';
    }
    return ship.replace('~', '');
  }
