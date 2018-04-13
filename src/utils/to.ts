import * as utils from 'ethereumjs-util'
import * as BN from 'bn.js'

export interface IEncodabletoString {
  toString(encoding? : string) : string
}

interface IHasLength {
  length: number
}

// Note: Do not use to.hex() when you really mean utils.addHexPrefix().
export function hex(val: string | number | IEncodabletoString) : string {
  if (typeof val === 'string') {
    if (val === '0x') {
      return '0x0'
    } else if ((val as string).indexOf('0x') == 0) {
      return String(val)
    } else {
      val = (new BN.BN(val) as IEncodabletoString)
    }
  }

  if (typeof val === 'number') {
    val = (val as number).toString(16)
  }

  if (typeof val === 'object') {
    val = (val as IEncodabletoString).toString('hex')

    if (val == '') {
      val = '0'
    }
  }

  // val is always string at this point
  return utils.addHexPrefix(val as string)
}

export function rpcQuantityHexString(val : string | number | IEncodabletoString) : string {
  let hexVal: string = this.hex(val)
  hexVal = '0x' + hexVal.replace('0x', '').replace(/^0+/, '')

  if (hexVal == '0x') {
    hexVal = '0x0'
  }

  return hexVal
}

export function rpcDataHexString(val: string | number | IEncodabletoString, length? : number) : string {
  let hexVal : string = this.hex(val).replace('0x', '')

  if (length == undefined) {
    if (typeof val === 'string' || typeof val === 'number') {
      length = hexVal.length
      length += hexVal.length % 2 // must have even number of digits
    } else {
      length = (val as IHasLength).length * 2
    }
  }

  if (length == 0) {
    return '0x'
  }

  // handle padding
  hexVal = _padStart(hexVal, length, '0')

  return '0x' + hexVal
}

export function hexWithZeroPadding(val : string | number | IEncodabletoString) : string {
  let hexVal : string = this.hex(val)
  const digits : string = hexVal.replace('0x', '')
  if (digits.length & 0x1) {
    return '0x0' + digits
  }
  return hexVal
}

export function number(val : string | number | IEncodabletoString) : number {
  if (typeof val === 'number') {
    return val
  }

  if (typeof val === 'string') {
    if (val.indexOf('0x') != 0) {
      return parseInt(val)
    }
  }

  return parseInt(utils.bufferToInt(utils.toBuffer(val)))
}

// modified slightly from `String.prototype.padStart()` polyfill on MDN
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart#Polyfill
function _padStart(stringToPad: string, targetLength: number, padString?: string) {
  targetLength = targetLength>>0 //truncate if number or convert non-number to 0
  padString = String((typeof padString !== 'undefined' ? padString : ' '))
  if (stringToPad.length > targetLength) {
    return String(stringToPad)
  } else {
    targetLength = targetLength-stringToPad.length;
    if (targetLength > padString.length) {
      padString += _repeat(padString, targetLength/padString.length); //append to original to ensure we are longer than needed
    }
    return padString.slice(0,targetLength) + String(stringToPad);
  }
}

// modified slightly from MDN `String.prototype.repeat` polyfill
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat#Polyfill
function _repeat(str: string, count: number) {
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }
    if (count == Infinity) {
      throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if (str.length == 0 || count == 0) {
      return '';
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
      throw new RangeError('repeat count must not overflow maximum string size');
    }
    var rpt = '';
    for (var i = 0; i < count; i++) {
      rpt += str;
    }
    return rpt;
  }
