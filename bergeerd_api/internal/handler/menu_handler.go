package handler

import (
	"errors"
	"net/http"
	"sort"
	"strings"

	"github.com/gin-gonic/gin"

	"bergeerd-api/internal/httputil"
	"bergeerd-api/internal/models"
	"bergeerd-api/internal/service"
)

// MenuHandler exposes the menu item REST endpoints (both public and admin).
type MenuHandler struct {
	svc  *service.MenuService
	cats *service.CategoryService // supplies dynamic category titles/order
}

// NewMenuHandler creates a MenuHandler. cats may be nil (legacy callers); when
// present, the public menu response is enriched with dynamic category titles.
func NewMenuHandler(svc *service.MenuService, cats *service.CategoryService) *MenuHandler {
	return &MenuHandler{svc: svc, cats: cats}
}

// maxImageSize limits single image uploads to 10 MB.
const maxImageSize = 10 << 20

// ListAll handles GET /api/admin/menu — every item (admin view).
//
// Items are sorted by the owning category's `order`, then by each item's
// `order`, then by ID. Sorting by category slug alphabetically would put
// "drinks" before "fries" and disagree with the website's category priority.
func (h *MenuHandler) ListAll(c *gin.Context) {
	items, err := h.svc.ListAll(c.Request.Context())
	if err != nil {
		httputil.Error(c, err)
		return
	}

	catOrder := map[string]int{}
	if h.cats != nil {
		if cats, cerr := h.cats.List(c.Request.Context()); cerr == nil {
			for _, cat := range cats {
				catOrder[cat.Slug] = cat.Order
			}
		}
	}

	sort.SliceStable(items, func(i, j int) bool {
		ci, cj := catOrder[string(items[i].Category)], catOrder[string(items[j].Category)]
		if ci != cj {
			return ci < cj
		}
		if items[i].Order != items[j].Order {
			return items[i].Order < items[j].Order
		}
		return items[i].ID.Hex() < items[j].ID.Hex()
	})

	httputil.OK(c, items)
}

// ListPublic handles GET /api/menu — active items grouped by category.
//
// When a CategoryService is wired, the response is ordered by the dynamic
// categories' `order` field and each group carries the human-friendly `title`
// (e.g. "برگرها") so the website can render section headings without any
// hardcoded map. If the categories collection is empty, it falls back to the
// historical fixed order so the site keeps working during seeding/migration.
func (h *MenuHandler) ListPublic(c *gin.Context) {
	items, err := h.svc.ListAll(c.Request.Context())
	if err != nil {
		httputil.Error(c, err)
		return
	}
	grouped := map[string][]models.MenuItem{}
	for _, it := range items {
		if !it.IsActive {
			continue
		}
		grouped[string(it.Category)] = append(grouped[string(it.Category)], it)
	}
	// Sort each category's items explicitly by Order ascending. The repository
	// already returns items sorted, but once we split them into per-category
	// slices via a map, the deterministic DB order is the only thing keeping
	// them correct — so we re-sort here as an explicit guarantee that the
	// website always renders items by their priority. A stable tiebreaker on
	// CreatedAt (then ID) keeps equal-order items deterministic.
	for cat, its := range grouped {
		sort.SliceStable(its, func(i, j int) bool {
			if its[i].Order != its[j].Order {
				return its[i].Order < its[j].Order
			}
			if !its[i].CreatedAt.Equal(its[j].CreatedAt) {
				return its[i].CreatedAt.Before(its[j].CreatedAt)
			}
			return its[i].ID.Hex() < its[j].ID.Hex()
		})
		grouped[cat] = its
	}

	type group struct {
		Category string            `json:"category"`
		Title    string            `json:"title"`
		Order    int               `json:"order"`
		Items    []models.MenuItem `json:"items"`
	}

	var cats []models.CategoryDoc
	if h.cats != nil {
		cats, _ = h.cats.List(c.Request.Context())
	}

	// Re-sort categories by Order ascending so the website section order is
	// driven only by priority, even if the repository sort is bypassed or
	// the collection was written without the order index.
	if len(cats) > 1 {
		sort.SliceStable(cats, func(i, j int) bool {
			if cats[i].Order != cats[j].Order {
				return cats[i].Order < cats[j].Order
			}
			return cats[i].ID.Hex() < cats[j].ID.Hex()
		})
	}

	if len(cats) > 0 {
		out := make([]group, 0, len(cats))
		for _, cat := range cats {
			if !cat.IsActive {
				continue
			}
			if v, ok := grouped[cat.Slug]; ok {
				title := cat.Title
				if title == "" {
					title = cat.Slug
				}
				out = append(out, group{
					Category: cat.Slug,
					Title:    title,
					Order:    cat.Order,
					Items:    v,
				})
			}
		}
		httputil.OK(c, out)
		return
	}

	// Fallback: historical fixed order (no dynamic categories yet).
	fallback := []struct {
		slug  string
		order int
	}{
		{"burgers", 1},
		{"sandwiches", 2},
		{"fries", 3},
		{"toppings", 4},
		{"drinks", 5},
	}
	out := make([]group, 0, len(fallback))
	for _, cat := range fallback {
		if v, ok := grouped[cat.slug]; ok {
			out = append(out, group{
				Category: cat.slug,
				Title:    cat.slug,
				Order:    cat.order,
				Items:    v,
			})
		}
	}
	httputil.OK(c, out)
}

// Get handles GET /api/admin/menu/:id.
func (h *MenuHandler) Get(c *gin.Context) {
	item, err := h.svc.Get(c.Request.Context(), c.Param("id"))
	if err != nil {
		h.writeServiceError(c, err)
		return
	}
	httputil.OK(c, item)
}

// Create handles POST /api/admin/menu.
func (h *MenuHandler) Create(c *gin.Context) {
	var in models.MenuItemInput
	if err := c.ShouldBindJSON(&in); err != nil {
		httputil.Error(c, httputil.NewAPIError(http.StatusBadRequest, "invalid JSON body"))
		return
	}
	item, err := h.svc.Create(c.Request.Context(), in)
	if err != nil {
		h.writeServiceError(c, err)
		return
	}
	httputil.Created(c, item)
}

// Update handles PUT /api/admin/menu/:id.
func (h *MenuHandler) Update(c *gin.Context) {
	var in models.MenuItemInput
	if err := c.ShouldBindJSON(&in); err != nil {
		httputil.Error(c, httputil.NewAPIError(http.StatusBadRequest, "invalid JSON body"))
		return
	}
	item, err := h.svc.Update(c.Request.Context(), c.Param("id"), in)
	if err != nil {
		h.writeServiceError(c, err)
		return
	}
	httputil.OK(c, item)
}

// Delete handles DELETE /api/admin/menu/:id.
func (h *MenuHandler) Delete(c *gin.Context) {
	if err := h.svc.Delete(c.Request.Context(), c.Param("id")); err != nil {
		h.writeServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"deleted": true}})
}

// UploadImage handles POST /api/admin/upload — multipart file "image".
// Returns the public URL of the stored image.
func (h *MenuHandler) UploadImage(c *gin.Context) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxImageSize)

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		httputil.Error(c, httputil.NewAPIError(http.StatusBadRequest, "image file is required (field name 'image', max 10MB)"))
		return
	}
	defer file.Close()

	// Basic content-type guard for safety.
	ct := header.Header.Get("Content-Type")
	if ct == "" || !strings.HasPrefix(ct, "image/") {
		httputil.Error(c, httputil.NewAPIError(http.StatusBadRequest, "file must be an image"))
		return
	}

	res, err := h.svc.UploadImage(c.Request.Context(), file, header.Size, header.Filename, ct)
	if err != nil {
		h.writeServiceError(c, err)
		return
	}
	httputil.Created(c, gin.H{
		"url":       res.URL,
		"object":    res.Object,
		"size":      res.Size,
		"mime_type": res.MimeType,
	})
}

// writeServiceError maps service-layer errors to HTTP responses.
func (h *MenuHandler) writeServiceError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, service.ErrNotFound):
		httputil.Error(c, httputil.NewAPIError(http.StatusNotFound, "menu item not found"))
	case errors.Is(err, service.ErrInvalidImage):
		httputil.Error(c, httputil.NewAPIError(http.StatusBadRequest, "invalid image file"))
	default:
		httputil.Error(c, err) // validation errors & unknown -> handled centrally
	}
}
