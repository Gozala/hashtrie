import { bitCount, popcount as popcount32 } from "./bitfield-uint32.js"
import * as API from "./api.js"

/**
 * @param {number} size
 * @returns {API.BitField<Uint8Array>}
 */
export const configure = size => {
  if (size % 8 !== 0) {
    throw new Error(`Must be multiple of 8`)
  }

  return {
    create: () => create(size),
    set,
    unset,
    get,
    toBytes,
    fromBytes,
    popcount,
    and,
    or,
    count,
  }
}

/**
 * @param {number} size
 */
export const create = size => {
  if (size % 8 !== 0) {
    throw new Error(`Must be multiple of 8`)
  }

  return new Uint8Array(size / 8)
}

/**
 * @param {Uint8Array} bitfield
 */
export const count = bitfield => bitfield.byteLength * 8

/**
 * Compute offset for the given index
 *
 * @param {Uint8Array} bitfield
 * @param {number} index
 */
const at = (bitfield, index) => {
  const byteOffset = bitfield.byteLength - 1 - ((index / 8) | 0)
  const bitOffset = index % 8
  const byte = bitfield[byteOffset]

  return { byte, byteOffset, bitOffset }
}

/**
 * Set a particular bit.
 *
 * @param {Uint8Array} bytes
 * @param {number} index
 * @param {number} byte
 * @returns {Uint8Array}
 */
const setByte = (bytes, index, byte) => {
  if (bytes[index] !== byte) {
    const result = bytes.slice(0)
    result[index] = byte
    return result
  }
  return bytes
}

/**
 * Set a particular bit.
 *
 * @param {Uint8Array} bitfield
 * @param {number} index
 * @returns {Uint8Array}
 */
export const set = (bitfield, index) => {
  const { byte, byteOffset, bitOffset } = at(bitfield, index)
  return setByte(bitfield, byteOffset, byte | (1 << bitOffset))
}

/**
 * Unsets a particular bit.

 * @param {Uint8Array} bitfield
 * @param {number} index
 * @returns {Uint8Array}
 */
export const unset = (bitfield, index) => {
  const { byte, byteOffset, bitOffset } = at(bitfield, index)
  return setByte(bitfield, byteOffset, byte & (0xff ^ (1 << bitOffset)))
}

/**
 * Returns `true` if bit at given index is set.
 *
 * @param {Uint8Array} bitfield
 * @param {number} index
 */
export const get = (bitfield, index) => {
  var { byte, bitOffset } = at(bitfield, index)
  return ((byte >> bitOffset) & 0x1) !== 0
}

/**
 * @param {Uint8Array} bitfield
 */
export const toBytes = bitfield => bitfield

/**
 * @param {Uint8Array} bytes
 */
export const fromBytes = bytes => bytes

/**
 * @param {Uint8Array} bitfield
 * @param {number} index
 */
export const popcount = (bitfield, index = bitfield.byteLength * 8) => {
  const { byteOffset, bitOffset, byte } = at(bitfield, index)

  let count = popcount32(byte, bitOffset)
  let offset = bitfield.byteLength - 1
  while (offset > byteOffset) {
    const byte = bitfield[offset]
    count += bitCount(byte)
    offset--
  }

  return count
}

/**
 * @param {Uint8Array} left
 * @param {Uint8Array} right
 */
export const or = (left, right) => {
  const result = left.slice()
  let offset = 0
  while (offset < left.length) {
    result[offset] |= right[offset]
    offset++
  }
  return result
}

/**
 * @param {Uint8Array} left
 * @param {Uint8Array} right
 */
export const and = (left, right) => {
  const result = left.slice()
  let offset = 0
  while (offset < left.length) {
    result[offset] &= right[offset]
    offset++
  }
  return result
}

export { API }
