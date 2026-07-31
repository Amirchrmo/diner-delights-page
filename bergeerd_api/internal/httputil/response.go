package httputil

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"bergeerd-api/internal/validation"
)

// OK writes a 200 JSON response.
func OK(c *gin.Context, data any) {
	c.JSON(http.StatusOK, gin.H{"data": data})
}

// Created writes a 201 JSON response.
func Created(c *gin.Context, data any) {
	c.JSON(http.StatusCreated, gin.H{"data": data})
}

// APIError is the canonical error type used across handlers. The caller picks
// the HTTP status; the message is returned to the client as-is.
type APIError struct {
	Status  int
	Message string
}

func (e *APIError) Error() string { return e.Message }

// NewAPIError constructs an APIError.
func NewAPIError(status int, message string) *APIError {
	return &APIError{Status: status, Message: message}
}

// Error writes a structured error response with an appropriate status code.
// It understands validation errors and APIError values.
func Error(c *gin.Context, err error) {
	if err == nil {
		c.JSON(http.StatusOK, gin.H{"data": nil})
		return
	}

	if ve := validation.AsValidationError(err); ve != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  "validation failed",
			"fields": ve.Errors,
		})
		return
	}

	var ae *APIError
	if errors.As(err, &ae) {
		c.JSON(ae.Status, gin.H{"error": ae.Message})
		return
	}

	// Fallback: never leak internal error details.
	c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
}
