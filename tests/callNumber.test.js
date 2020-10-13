const { normalize, deweyNormalize } = require('../src/callNumber')

describe('callNumber', () => {
  describe('normalize Library of Congress call numbers', () => {
    describe('test various call numbers', () => {
      const testSet = [
        {
          input: 'SPA',
          expectedStart: 'SPA',
          expectedEnd: 'SPA',
        },
        {
          input: '     CD-ROM A 123',
          expectedStart: 'A  0123',
          expectedEnd: 'A~~012399~999~999~999',
        },
        {
          input: 'KF .X1',
          expectedStart: 'KF 000000X001',
          expectedEnd: 'KF~999999X001~999~999',
        },
        {
          input: 'KF11 .T2',
          expectedStart: 'KF 001100T002',
          expectedEnd: 'KF~001199T002~999~999',
        },
        {
          input: 'PE 25 .E58 no.292',
          expectedStart: 'PE 002500E058 000 000 NO.292',
          expectedEnd: 'PE~002599E058~999~999 NO.292',
        },
        {
          input: 'PQ 6267 .E4 B188 L8 1907',
          expectedStart: 'PQ 626700E004B188L008 1907',
          expectedEnd: 'PQ~626799E004B188L008 1907',
        },
        {
          input: 'U 264 .T43 2002',
          expectedStart: 'U  026400T043 000 000 2002',
          expectedEnd: 'U~~026499T043~999~999 2002',
        },
        {
          input: 'LD4112.7.H47 G64 2004',
          expectedStart: 'LD 411207H047G064 000 2004',
          expectedEnd: 'LD~411207H047G064~999 2004',
        },
        {
          // This gibberish shouldn't return anything intelligible.
          // If a range is specified we can't really compare against this, so expect null.
          input: 'MF Cabinet 1-6: CIS 97 S385-28',
          expectedStart: null,
          expectedEnd: null,
        },
        {
          // Without spaces between the digits it's not a valid call number
          input: 'A 123.42.149',
          expectedStart: null,
          expectedEnd: null,
        },
        {
          // Just make sure it doesn't crash and burn :)
          input: '',
          expectedStart: null,
          expectedEnd: null,
        }
      ]

      testSet.forEach(record => {
        test(`should handle normalizing call number "${record.input}"`, async () => {
          expect(normalize(record.input)).toEqual(record.expectedStart)
          expect(normalize(record.input, true)).toEqual(record.expectedEnd)
        })
      })
    })
  })

  describe('normalize Dewey Decimal call numbers', () => {
    // Samples: 463 C344
    // 378.01 H45h
    // 378.772 M68 2019
    describe('test various call numbers', () => {
      // We only match against the first part of the call number, so it is sort of truncated in "normalization"
      const testSet = [
        {
          input: '463 C344',
          expected: 'D 0000463',
        },
        {
          input: '378.01 H45h',
          expected: 'D 0000378',
        },
        {
          input: '378.772 M68 2019',
          expected: 'D 0000378',
        },
        {
          input: 'ABCD 123', // Invalid
          expected: null,
        },
        {
          input: '',
          expected: null,
        }
      ]

      testSet.forEach(record => {
        test(`should handle normalizing call number "${record.input}"`, async () => {
          expect(deweyNormalize(record.input)).toEqual(record.expected)
        })
      })
    })
  })
})
