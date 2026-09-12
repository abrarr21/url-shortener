// this test covers input validation for the shorten endpoint - confirming empty input, malformed URLs, and disallowed schemes (eg. ftp) are rejected before ever reaching the database, while valid http/https urls pass trhough
package handler

import "testing"

func TestValidationURL(t *testing.T) {
	cases := []struct {
		input   string
		wantErr bool
	}{
		{"", true},
		{"not a url", true},
		{"ftp://example.com", true},
		{"https://example.com/path", false},
		{"http://example.com", false},
	}

	for _, c := range cases {
		err := validateURL(c.input)
		if (err != nil) != c.wantErr {
			t.Errorf("validateURL (%q) error = %v, wantErr %v", c.input, err, c.wantErr)
		}
	}
}
