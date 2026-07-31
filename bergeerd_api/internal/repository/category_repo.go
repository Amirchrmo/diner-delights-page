package repository

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"bergeerd-api/internal/models"
)

// CategoryRepo persists dynamic menu categories in MongoDB.
type CategoryRepo struct {
	col *mongo.Collection
}

// NewCategoryRepo returns a repository backed by the given database.
func NewCategoryRepo(db *mongo.Database) *CategoryRepo {
	return &CategoryRepo{col: db.Collection("categories")}
}

// EnsureIndexes creates a unique index on slug. Safe to call repeatedly.
func (r *CategoryRepo) EnsureIndexes(ctx context.Context) error {
	_, err := r.col.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "slug", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "order", Value: 1}, {Key: "_id", Value: 1}}},
	})
	return err
}

// List returns all categories ordered by order then insertion.
func (r *CategoryRepo) List(ctx context.Context) ([]models.CategoryDoc, error) {
	cur, err := r.col.Find(ctx, bson.M{},
		options.Find().SetSort(bson.D{
			{Key: "order", Value: 1},
			{Key: "_id", Value: 1},
		}))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var cats []models.CategoryDoc
	if err := cur.All(ctx, &cats); err != nil {
		return nil, err
	}
	if cats == nil {
		cats = []models.CategoryDoc{}
	}
	return cats, nil
}

// Get returns a single category by its hex ID.
func (r *CategoryRepo) Get(ctx context.Context, id string) (models.CategoryDoc, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return models.CategoryDoc{}, ErrNotFound
	}
	var cat models.CategoryDoc
	if err := r.col.FindOne(ctx, bson.M{"_id": oid}).Decode(&cat); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return models.CategoryDoc{}, ErrNotFound
		}
		return models.CategoryDoc{}, err
	}
	return cat, nil
}

// FindBySlug returns a category by its slug, if it exists.
func (r *CategoryRepo) FindBySlug(ctx context.Context, slug string) (models.CategoryDoc, error) {
	var cat models.CategoryDoc
	if err := r.col.FindOne(ctx, bson.M{"slug": slug}).Decode(&cat); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return models.CategoryDoc{}, ErrNotFound
		}
		return models.CategoryDoc{}, err
	}
	return cat, nil
}

// Create inserts a new category.
func (r *CategoryRepo) Create(ctx context.Context, cat *models.CategoryDoc) error {
	if cat.ID.IsZero() {
		cat.ID = primitive.NewObjectID()
	}
	now := time.Now().UTC()
	if cat.CreatedAt.IsZero() {
		cat.CreatedAt = now
	}
	cat.UpdatedAt = now
	if _, err := r.col.InsertOne(ctx, cat); err != nil {
		return err
	}
	return nil
}

// Update applies a partial update (bson.M) to the category with the given id.
func (r *CategoryRepo) Update(ctx context.Context, id string, update bson.M) error {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return ErrNotFound
	}
	if set, ok := update["$set"].(bson.M); ok {
		set["updated_at"] = time.Now().UTC()
	} else {
		update["$set"] = bson.M{"updated_at": time.Now().UTC()}
	}
	res, err := r.col.UpdateByID(ctx, oid, update)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return ErrNotFound
	}
	return nil
}

// Delete removes a category by id.
func (r *CategoryRepo) Delete(ctx context.Context, id string) error {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return ErrNotFound
	}
	res, err := r.col.DeleteOne(ctx, bson.M{"_id": oid})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return ErrNotFound
	}
	return nil
}

// Count returns the total number of categories (used for seeding).
func (r *CategoryRepo) Count(ctx context.Context) (int64, error) {
	return r.col.CountDocuments(ctx, bson.M{})
}

// InsertMany inserts several categories at once (used for seeding).
func (r *CategoryRepo) InsertMany(ctx context.Context, cats []models.CategoryDoc) error {
	if len(cats) == 0 {
		return nil
	}
	docs := make([]any, len(cats))
	now := time.Now().UTC()
	for i := range cats {
		if cats[i].ID.IsZero() {
			cats[i].ID = primitive.NewObjectID()
		}
		if cats[i].CreatedAt.IsZero() {
			cats[i].CreatedAt = now
		}
		cats[i].UpdatedAt = now
		docs[i] = cats[i]
	}
	_, err := r.col.InsertMany(ctx, docs)
	return err
}
