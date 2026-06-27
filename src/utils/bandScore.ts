// IELTS Academic Reading band score conversion table
// Raw score out of 40 → Band score
const BAND_SCORE_TABLE: Record<number, number> = {
  39: 9.0, 40: 9.0,
  37: 8.5, 38: 8.5,
  35: 8.0, 36: 8.0,
  33: 7.5, 34: 7.5,
  30: 7.0, 31: 7.0, 32: 7.0,
  27: 6.5, 28: 6.5, 29: 6.5,
  23: 6.0, 24: 6.0, 25: 6.0, 26: 6.0,
  19: 5.5, 20: 5.5, 21: 5.5, 22: 5.5,
  15: 5.0, 16: 5.0, 17: 5.0, 18: 5.0,
  13: 4.5, 14: 4.5,
  10: 4.0, 11: 4.0, 12: 4.0,
  8:  3.5, 9:  3.5,
  6:  3.0, 7:  3.0,
  4:  2.5, 5:  2.5,
};

export function calculateBandScore(rawScore: number, totalQuestions: number = 40): number {
  // Normalize to 40-question scale
  const normalized = Math.round((rawScore / totalQuestions) * 40);
  const capped = Math.max(0, Math.min(40, normalized));

  for (let score = capped; score >= 0; score--) {
    if (BAND_SCORE_TABLE[score] !== undefined) {
      return BAND_SCORE_TABLE[score];
    }
  }
  return 1.0;
}
