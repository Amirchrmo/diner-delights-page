package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"bergeerd-api/internal/httputil"
	"bergeerd-api/internal/models"
	"bergeerd-api/internal/service"
)

// AuthHandler exposes authentication endpoints.
type AuthHandler struct {
	svc *service.AuthService
}

// NewAuthHandler creates an AuthHandler.
func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

// Login handles POST /api/auth/login.
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httputil.Error(c, httputil.NewAPIError(http.StatusBadRequest, "username and password are required"))
		return
	}

	resp, err := h.svc.Login(c.Request.Context(), req.Username, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			httputil.Error(c, httputil.NewAPIError(http.StatusUnauthorized, "invalid username or password"))
			return
		}
		httputil.Error(c, err)
		return
	}
	httputil.OK(c, resp)
}
