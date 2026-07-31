package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"bergeerd-api/internal/httputil"
	"bergeerd-api/internal/models"
	"bergeerd-api/internal/service"
)

// CategoryHandler exposes the category REST endpoints (public + admin CRUD).
type CategoryHandler struct {
	svc *service.CategoryService
}

// NewCategoryHandler creates a CategoryHandler.
func NewCategoryHandler(svc *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{svc: svc}
}

// ListPublic handles GET /api/categories — all categories, ordered.
func (h *CategoryHandler) ListPublic(c *gin.Context) {
	cats, err := h.svc.List(c.Request.Context())
	if err != nil {
		httputil.Error(c, err)
		return
	}
	httputil.OK(c, cats)
}

// ListAll handles GET /api/admin/categories — same as public but under auth.
func (h *CategoryHandler) ListAll(c *gin.Context) {
	cats, err := h.svc.List(c.Request.Context())
	if err != nil {
		httputil.Error(c, err)
		return
	}
	httputil.OK(c, cats)
}

// Get handles GET /api/admin/categories/:id.
func (h *CategoryHandler) Get(c *gin.Context) {
	cat, err := h.svc.Get(c.Request.Context(), c.Param("id"))
	if err != nil {
		h.writeServiceError(c, err)
		return
	}
	httputil.OK(c, cat)
}

// Create handles POST /api/admin/categories.
func (h *CategoryHandler) Create(c *gin.Context) {
	var in models.CategoryInput
	if err := c.ShouldBindJSON(&in); err != nil {
		httputil.Error(c, httputil.NewAPIError(http.StatusBadRequest, "invalid JSON body"))
		return
	}
	cat, err := h.svc.Create(c.Request.Context(), in)
	if err != nil {
		h.writeServiceError(c, err)
		return
	}
	httputil.Created(c, cat)
}

// Update handles PUT /api/admin/categories/:id.
func (h *CategoryHandler) Update(c *gin.Context) {
	var in models.CategoryInput
	if err := c.ShouldBindJSON(&in); err != nil {
		httputil.Error(c, httputil.NewAPIError(http.StatusBadRequest, "invalid JSON body"))
		return
	}
	cat, err := h.svc.Update(c.Request.Context(), c.Param("id"), in)
	if err != nil {
		h.writeServiceError(c, err)
		return
	}
	httputil.OK(c, cat)
}

// Delete handles DELETE /api/admin/categories/:id.
func (h *CategoryHandler) Delete(c *gin.Context) {
	if err := h.svc.Delete(c.Request.Context(), c.Param("id")); err != nil {
		h.writeServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"deleted": true}})
}

// writeServiceError maps service-layer errors to HTTP responses.
func (h *CategoryHandler) writeServiceError(c *gin.Context, err error) {
	if errors.Is(err, service.ErrNotFound) {
		httputil.Error(c, httputil.NewAPIError(http.StatusNotFound, "category not found"))
		return
	}
	httputil.Error(c, err) // validation errors & unknown -> handled centrally
}
