package service

import (
	"context"
	"errors"
	"io"
	"strings"

	"go.mongodb.org/mongo-driver/bson"

	"bergeerd-api/internal/models"
	"bergeerd-api/internal/repository"
	"bergeerd-api/internal/storage"
	"bergeerd-api/internal/validation"
)

// Errors returned by the service layer.
var (
	ErrNotFound     = errors.New("menu item not found")
	ErrValidation   = errors.New("validation failed")
	ErrInvalidImage = errors.New("invalid image file")
)

// MenuService orchestrates menu item CRUD and image management.
type MenuService struct {
	repo   *repository.MenuItemRepo
	minio  *storage.MinioStorage
	cats   *CategoryService // for dynamic category validation
}

// NewMenuService wires the service with its dependencies. cats may be nil
// (legacy callers); when present, menu item category fields are validated
// against the dynamic categories in the database.
func NewMenuService(repo *repository.MenuItemRepo, minio *storage.MinioStorage, cats *CategoryService) *MenuService {
	return &MenuService{repo: repo, minio: minio, cats: cats}
}

// ListAll returns every menu item (admin view, including inactive ones).
func (s *MenuService) ListAll(ctx context.Context) ([]models.MenuItem, error) {
	return s.repo.List(ctx)
}

// ListByCategory returns active items for the website grouped by category.
func (s *MenuService) ListByCategory(ctx context.Context, cat models.Category) ([]models.MenuItem, error) {
	if !validation.IsValidCategory(cat) {
		return nil, ErrValidation
	}
	return s.repo.ListByCategory(ctx, cat)
}

// Get returns a single item by id.
func (s *MenuService) Get(ctx context.Context, id string) (models.MenuItem, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return models.MenuItem{}, ErrNotFound
		}
		return models.MenuItem{}, err
	}
	return item, nil
}

// Create validates and inserts a new menu item.
func (s *MenuService) Create(ctx context.Context, in models.MenuItemInput) (models.MenuItem, error) {
	if err := validation.ValidateMenuItemInput(in, true); err != nil {
		return models.MenuItem{}, err
	}
	if in.Category != nil {
		if err := s.validateCategoryDynamic(ctx, *in.Category); err != nil {
			return models.MenuItem{}, err
		}
	}

	item := models.MenuItem{
		Name:        strings.TrimSpace(*in.Name),
		Description: derefString(in.Description),
		Price:       strings.TrimSpace(*in.Price),
		ImageURL:    derefString(in.ImageURL),
		ImageAlt:    derefString(in.ImageAlt),
		Category:    models.Category(strings.TrimSpace(*in.Category)),
		IsActive:    derefBool(in.IsActive, true),
	}
	if in.Order != nil {
		item.Order = *in.Order
	}

	if err := s.repo.Create(ctx, &item); err != nil {
		return models.MenuItem{}, err
	}
	return item, nil
}

// Update applies a partial update to an existing item. Only provided fields change.
func (s *MenuService) Update(ctx context.Context, id string, in models.MenuItemInput) (models.MenuItem, error) {
	if err := validation.ValidateMenuItemInput(in, false); err != nil {
		return models.MenuItem{}, err
	}
	if in.Category != nil {
		if err := s.validateCategoryDynamic(ctx, *in.Category); err != nil {
			return models.MenuItem{}, err
		}
	}

	existing, err := s.repo.Get(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return models.MenuItem{}, ErrNotFound
		}
		return models.MenuItem{}, err
	}

	set := bson.M{}
	if in.Name != nil {
		set["name"] = strings.TrimSpace(*in.Name)
	}
	if in.Description != nil {
		set["description"] = strings.TrimSpace(*in.Description)
	}
	if in.Price != nil {
		set["price"] = strings.TrimSpace(*in.Price)
	}
	if in.ImageURL != nil {
		newURL := strings.TrimSpace(*in.ImageURL)
		oldObj := s.minio.ObjectFromURL(existing.ImageURL)
		// If the image is being replaced, delete the old object from MinIO.
		if oldObj != "" && s.minio.ObjectFromURL(newURL) != oldObj {
			_ = s.minio.DeleteObject(ctx, oldObj)
		}
		set["image_url"] = newURL
	}
	if in.ImageAlt != nil {
		set["image_alt"] = strings.TrimSpace(*in.ImageAlt)
	}
	if in.Category != nil {
		set["category"] = strings.TrimSpace(*in.Category)
	}
	if in.Order != nil {
		set["order"] = *in.Order
	}
	if in.IsActive != nil {
		set["is_active"] = *in.IsActive
	}

	if err := s.repo.Update(ctx, id, bson.M{"$set": set}); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return models.MenuItem{}, ErrNotFound
		}
		return models.MenuItem{}, err
	}
	return s.repo.Get(ctx, id)
}

// Delete removes an item and its associated image from MinIO.
func (s *MenuService) Delete(ctx context.Context, id string) error {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return ErrNotFound
		}
		return err
	}
	if obj := s.minio.ObjectFromURL(item.ImageURL); obj != "" {
		_ = s.minio.DeleteObject(ctx, obj)
	}
	if err := s.repo.Delete(ctx, id); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return ErrNotFound
		}
		return err
	}
	return nil
}

// UploadImage stores an image and returns its public URL.
func (s *MenuService) UploadImage(ctx context.Context, reader io.Reader, size int64, name, contentType string) (storage.UploadResult, error) {
	if size <= 0 {
		return storage.UploadResult{}, ErrInvalidImage
	}
	return s.minio.UploadImage(ctx, reader, size, name, contentType)
}

// Count returns the total number of menu items.
func (s *MenuService) Count(ctx context.Context) (int64, error) {
	return s.repo.Count(ctx)
}

// SeedIfEmpty inserts the provided demo items when the collection is empty.
func (s *MenuService) SeedIfEmpty(ctx context.Context, items []models.MenuItem) error {
	count, err := s.repo.Count(ctx)
	if err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	return s.repo.InsertMany(ctx, items)
}

func derefString(p *string) string {
	if p == nil {
		return ""
	}
	return strings.TrimSpace(*p)
}

func derefBool(p *bool, def bool) bool {
	if p == nil {
		return def
	}
	return *p
}

// validateCategoryDynamic checks the supplied category slug against the dynamic
// categories in the database (via the CategoryService cache). It is a no-op when
// no CategoryService is wired (legacy callers), and accepts any non-empty slug
// when the categories collection is empty (seeding scenario), so the system
// never deadlocks itself out of inserting data.
func (s *MenuService) validateCategoryDynamic(ctx context.Context, category string) error {
	if s.cats == nil {
		return nil
	}
	ok, err := s.cats.IsValidSlug(ctx, strings.TrimSpace(category))
	if err != nil {
		return err
	}
	if !ok {
		return validation.NewFieldError("category", "unknown category; create it first in the Categories page")
	}
	return nil
}

