package service

import (
	"context"
	"errors"
	"strings"
	"sync"

	"go.mongodb.org/mongo-driver/bson"

	"bergeerd-api/internal/models"
	"bergeerd-api/internal/repository"
	"bergeerd-api/internal/validation"
)

// CategoryService orchestrates dynamic category CRUD and provides a cached
// lookup used when validating menu items.
type CategoryService struct {
	repo *repository.CategoryRepo

	mu       sync.RWMutex
	cache    map[string]struct{} // set of known category slugs
	cacheTTL int64               // unix seconds when cache expires (0 = empty)
}

// NewCategoryService wires the service with its repository.
func NewCategoryService(repo *repository.CategoryRepo) *CategoryService {
	return &CategoryService{repo: repo}
}

// refreshCache loads the current set of category slugs into memory. It is
// called lazily (and after mutations) so menu-item validation never hits the
// DB on the hot path unless the cache is cold/expired.
func (s *CategoryService) refreshCache(ctx context.Context) error {
	cats, err := s.repo.List(ctx)
	if err != nil {
		return err
	}
	set := make(map[string]struct{}, len(cats))
	for _, c := range cats {
		set[strings.ToLower(c.Slug)] = struct{}{}
	}
	s.mu.Lock()
	s.cache = set
	s.mu.Unlock()
	return nil
}

// IsValidSlug reports whether a category slug is known. If the cache is empty
// it is (re)built from the database. Unknown slugs are rejected unless the DB
// contains zero categories (e.g. during seeding before categories exist), in
// which case we allow any non-empty slug as a safety valve.
func (s *CategoryService) IsValidSlug(ctx context.Context, slug string) (bool, error) {
	slug = strings.ToLower(strings.TrimSpace(slug))
	if slug == "" {
		return false, nil
	}
	s.mu.RLock()
	if len(s.cache) > 0 {
		_, ok := s.cache[slug]
		s.mu.RUnlock()
		return ok, nil
	}
	s.mu.RUnlock()
	if err := s.refreshCache(ctx); err != nil {
		return false, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	// Empty DB → seeding scenario: allow any non-empty slug.
	if len(s.cache) == 0 {
		return true, nil
	}
	_, ok := s.cache[slug]
	return ok, nil
}

// Invalidate drops the in-memory cache so the next lookup rebuilds it.
// Called after any create/update/delete on categories.
func (s *CategoryService) Invalidate() {
	s.mu.Lock()
	s.cache = nil
	s.mu.Unlock()
}

// List returns all categories.
func (s *CategoryService) List(ctx context.Context) ([]models.CategoryDoc, error) {
	return s.repo.List(ctx)
}

// Get returns a single category by id.
func (s *CategoryService) Get(ctx context.Context, id string) (models.CategoryDoc, error) {
	cat, err := s.repo.Get(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return models.CategoryDoc{}, ErrNotFound
		}
		return models.CategoryDoc{}, err
	}
	return cat, nil
}

// Create validates and inserts a new category.
func (s *CategoryService) Create(ctx context.Context, in models.CategoryInput) (models.CategoryDoc, error) {
	if err := validation.ValidateCategoryInput(in, true); err != nil {
		return models.CategoryDoc{}, err
	}
	// Unique slug check: FindBySlug returns ErrNotFound when the slug is free.
	if _, err := s.repo.FindBySlug(ctx, strings.TrimSpace(*in.Slug)); err == nil {
		return models.CategoryDoc{}, validation.NewFieldError("slug", "a category with this slug already exists")
	} else if !errors.Is(err, repository.ErrNotFound) {
		return models.CategoryDoc{}, err
	}
	cat := models.CategoryDoc{
		Slug:     strings.TrimSpace(*in.Slug),
		Title:    strings.TrimSpace(*in.Title),
		IsActive: derefBool(in.IsActive, true),
	}
	if in.Order != nil {
		cat.Order = *in.Order
	}
	if err := s.repo.Create(ctx, &cat); err != nil {
		// Mongo duplicate-key → friendly message.
		if isDupKeyErr(err) {
			return models.CategoryDoc{}, validation.NewFieldError("slug", "a category with this slug already exists")
		}
		return models.CategoryDoc{}, err
	}
	s.Invalidate()
	return cat, nil
}

// Update applies a partial update to an existing category.
func (s *CategoryService) Update(ctx context.Context, id string, in models.CategoryInput) (models.CategoryDoc, error) {
	if err := validation.ValidateCategoryInput(in, false); err != nil {
		return models.CategoryDoc{}, err
	}
	existing, err := s.repo.Get(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return models.CategoryDoc{}, ErrNotFound
		}
		return models.CategoryDoc{}, err
	}
	set := bson.M{}
	if in.Slug != nil {
		newSlug := strings.TrimSpace(*in.Slug)
		if newSlug != existing.Slug {
			if other, err := s.repo.FindBySlug(ctx, newSlug); err == nil && other.ID != existing.ID {
				return models.CategoryDoc{}, validation.NewFieldError("slug", "a category with this slug already exists")
			}
		}
		set["slug"] = newSlug
	}
	if in.Title != nil {
		set["title"] = strings.TrimSpace(*in.Title)
	}
	if in.Order != nil {
		set["order"] = *in.Order
	}
	if in.IsActive != nil {
		set["is_active"] = *in.IsActive
	}
	if len(set) > 0 {
		if err := s.repo.Update(ctx, id, bson.M{"$set": set}); err != nil {
			if isDupKeyErr(err) {
				return models.CategoryDoc{}, validation.NewFieldError("slug", "a category with this slug already exists")
			}
			if errors.Is(err, repository.ErrNotFound) {
				return models.CategoryDoc{}, ErrNotFound
			}
			return models.CategoryDoc{}, err
		}
	}
	s.Invalidate()
	return s.repo.Get(ctx, id)
}

// Delete removes a category. Menu items referencing it are left untouched
// (they keep their category string); the admin UI can re-assign them.
func (s *CategoryService) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return ErrNotFound
		}
		return err
	}
	s.Invalidate()
	return nil
}

// SeedIfEmpty inserts the default categories when none exist.
func (s *CategoryService) SeedIfEmpty(ctx context.Context, cats []models.CategoryDoc) error {
	n, err := s.repo.Count(ctx)
	if err != nil {
		return err
	}
	if n > 0 {
		return nil
	}
	if err := s.repo.InsertMany(ctx, cats); err != nil {
		return err
	}
	s.Invalidate()
	return nil
}

// isDupKeyErr reports whether err is a MongoDB duplicate-key error (E11000).
func isDupKeyErr(err error) bool {
	if err == nil {
		return false
	}
	// Match on the driver's error message; avoids importing mongo.WriteException
	// type here. The E11000 duplicate key message is stable across versions.
	return containsAny(err.Error(), "E11000", "duplicate key")
}

func containsAny(s string, subs ...string) bool {
	for _, sub := range subs {
		if sub == "" {
			continue
		}
		if idx := strings.Index(s, sub); idx >= 0 {
			return true
		}
	}
	return false
}
