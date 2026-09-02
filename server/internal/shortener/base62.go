package shortener

const base62Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

func toBase62(generatedNum int64) string {
	if generatedNum == 0 {
		return string(base62Chars[0])
	}

	var result []byte
	for generatedNum > 0 {
		remainder := generatedNum % 62
		result = append(result, base62Chars[remainder])
		generatedNum /= 62
	}

	// reverse the result to get the correct order
	i := 0
	j := len(result) - 1

	for i < j {
		result[i], result[j] = result[j], result[i]

		i++
		j--
	}

	return string(result)
}
