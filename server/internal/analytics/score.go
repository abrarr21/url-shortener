package analytics

import (
	"math"
	"time"
)

const gravity = 1.8

func DecayedScore(clickCount int64, age time.Duration) float64 {
	ageHours := age.Hours()
	if ageHours < 0 {
		ageHours = 0
	}
	numerator := math.Log10(float64(clickCount) + 1)
	denominator := math.Pow(ageHours+2, gravity)
	return numerator / denominator
}

// DecayedScore calculates a popularity score where clicks increase the score,
// while older URLs naturally lose ranking over time.
//
// The formula is:
//   log10(clicks + 1) / (ageHours + 2)^gravity
//
// Log10 reduces the impact of very large click counts, while the age penalty
// makes recent activity more valuable than old activity.
