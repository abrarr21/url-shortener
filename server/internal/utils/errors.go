package utils

import (
	"encoding/json"
	"net/http"
)

type CodeType string

const (
	CodeInvalidID CodeType = "invalid_id"

	// Request errors
	CodeBadRequest   CodeType = "bad_request"
	CodeInvalidInput CodeType = "invalid_input"
	CodeMissingField CodeType = "missing_field"

	// Authentication & authorization
	CodeUnauthorized CodeType = "unauthorized"
	CodeForbidden    CodeType = "forbidden"

	// Resource errors
	CodeNotFound      CodeType = "not_found"
	CodeConflict      CodeType = "conflict"
	CodeAlreadyExists CodeType = "already_exists"

	// Rate limiting
	CodeRateLimited CodeType = "rate_limited"

	// Server errors
	CodeInternal    CodeType = "internal_error"
	CodeUnavailable CodeType = "service_unavailable"
	CodeTimeout     CodeType = "timeout"
)

type errorEnvelope struct {
	Error errorPayload `json:"error"`
}

type errorPayload struct {
	Code    CodeType `json:"code"`
	Message string   `json:"message"`
	Details any      `json:"details,omitempty"`
}

func Error(w http.ResponseWriter, status int, message string, code CodeType, details any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(errorEnvelope{
		Error: errorPayload{
			Code:    code,
			Message: message,
			Details: details,
		},
	})
}
