package validation

import (
	"errors"
	"strings"

	"bergeerd-api/internal/models"
)

// ValidCategories is the set of allowed category values.
var ValidCategories = []models.Category{
	models.CategoryBurgers,
	models.CategorySandwiches,
	models.CategoryFries,
	models.CategoryToppings,
	models.CategoryDrinks,
}

// ErrValidation aggregates multiple field validation errors.
type ErrValidation struct {
	Errors map[string]string
}

func (e *ErrValidation) Error() string {
	if len(e.Errors) == 0 {
		return "validation failed"
	}
	parts := make([]string, 0, len(e.Errors))
	for k, v := range e.Errors {
		parts = append(parts, k+": "+v)
	}
	return strings.Join(parts, "; ")
}

// add records a field error.
func (e *ErrValidation) add(field, msg string) {
	if e.Errors == nil {
		e.Errors = map[string]string{}
	}
	e.Errors[field] = msg
}

// Has reports whether any validation errors were recorded.
func (e *ErrValidation) Has() bool { return len(e.Errors) > 0 }

// IsValidCategory reports whether c is a known category.
func IsValidCategory(c models.Category) bool {
	for _, v := range ValidCategories {
		if v == c {
			return true
		}
	}
	return false
}

// ValidateMenuItemInput validates a create/update payload. For create,
// requireName should be true so the name field is mandatory.
func ValidateMenuItemInput(in models.MenuItemInput, requireName bool) error {
	v := &ErrValidation{}

	if in.Name != nil {
		name := strings.TrimSpace(*in.Name)
		if name == "" {
			v.add("name", "must not be empty")
		} else if len(name) > 120 {
			v.add("name", "must be at most 120 characters")
		}
	} else if requireName {
		v.add("name", "is required")
	}

	if in.Description != nil && len(*in.Description) > 600 {
		v.add("description", "must be at most 600 characters")
	}

	if in.Price != nil {
		price := strings.TrimSpace(*in.Price)
		if price == "" {
			v.add("price", "must not be empty")
		} else if len(price) > 40 {
			v.add("price", "must be at most 40 characters")
		}
	} else if requireName {
		v.add("price", "is required")
	}

	if in.Category != nil {
		cat := strings.TrimSpace(*in.Category)
		if cat == "" {
			v.add("category", "must not be empty")
		}
		// NOTE: category slug existence is validated dynamically against the
		// `categories` collection in MenuService.validateCategoryDynamic, so we
		// no longer reject unknown slugs here. This lets admins create items
		// for newly-added categories.
	} else if requireName {
		v.add("category", "is required")
	}

	if in.ImageURL != nil {
		if strings.TrimSpace(*in.ImageURL) == "" {
			v.add("image_url", "must not be empty when provided")
		} else if len(*in.ImageURL) > 500 {
			v.add("image_url", "must be at most 500 characters")
		}
	}

	if in.ImageAlt != nil && len(*in.ImageAlt) > 200 {
		v.add("image_alt", "must be at most 200 characters")
	}

	if in.Order != nil && *in.Order < 0 {
		v.add("order", "must be zero or positive")
	}

	if v.Has() {
		return v
	}
	return nil
}

// AsValidationError returns the error as a *ErrValidation if it is one, else nil.
func AsValidationError(err error) *ErrValidation {
	var v *ErrValidation
	if errors.As(err, &v) {
		return v
	}
	return nil
}

// NewFieldError returns a single-field validation error.
func NewFieldError(field, msg string) *ErrValidation {
	return &ErrValidation{Errors: map[string]string{field: msg}}
}

// ValidateCategoryInput validates a create/update category payload. For create
// (requireFields=true), slug and title are mandatory.
func ValidateCategoryInput(in models.CategoryInput, requireFields bool) error {
	v := &ErrValidation{}

	if in.Slug != nil {
		slug := strings.TrimSpace(*in.Slug)
		if slug == "" {
			v.add("slug", "must not be empty")
		} else if len(slug) > 60 {
			v.add("slug", "must be at most 60 characters")
		} else if !isValidSlug(slug) {
			v.add("slug", "must contain only lowercase letters, numbers, and hyphens")
		}
	} else if requireFields {
		v.add("slug", "is required")
	}

	if in.Title != nil {
		title := strings.TrimSpace(*in.Title)
		if title == "" {
			v.add("title", "must not be empty")
		} else if len(title) > 120 {
			v.add("title", "must be at most 120 characters")
		}
	} else if requireFields {
		v.add("title", "is required")
	}

	if in.Order != nil && *in.Order < 0 {
		v.add("order", "must be zero or positive")
	}

	if v.Has() {
		return v
	}
	return nil
}

// isValidSlug reports whether s is a lowercase kebab-case slug, e.g. "burgers".
func isValidSlug(s string) bool {
	for _, r := range s {
		if !(r >= 'a' && r <= 'z') && !(r >= '0' && r <= '9') && r != '-' {
			return false
		}
	}
	return len(s) > 0
}
