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

// ErrNotFound is returned when no document matches the query.
var ErrNotFound = errors.New("document not found")

// MenuItemRepo persists menu items in MongoDB.
type MenuItemRepo struct {
	col *mongo.Collection
}

// NewMenuItemRepo returns a repository backed by the given database.
func NewMenuItemRepo(db *mongo.Database) *MenuItemRepo {
	return &MenuItemRepo{col: db.Collection("menu_items")}
}

// EnsureIndexes creates the indexes used for querying/ordering. Safe to call repeatedly.
func (r *MenuItemRepo) EnsureIndexes(ctx context.Context) error {
	_, err := r.col.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "category", Value: 1}, {Key: "order", Value: 1}, {Key: "_id", Value: 1}}},
		{Keys: bson.D{{Key: "is_active", Value: 1}}},
	})
	return err
}

// List returns all items ordered by category then custom order then insertion.
func (r *MenuItemRepo) List(ctx context.Context) ([]models.MenuItem, error) {
	cur, err := r.col.Find(ctx, bson.M{},
		options.Find().SetSort(bson.D{
			{Key: "category", Value: 1},
			{Key: "order", Value: 1},
			{Key: "_id", Value: 1},
		}))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var items []models.MenuItem
	if err := cur.All(ctx, &items); err != nil {
		return nil, err
	}
	if items == nil {
		items = []models.MenuItem{}
	}
	return items, nil
}

// ListByCategory returns active items for a single category (used by the website).
func (r *MenuItemRepo) ListByCategory(ctx context.Context, cat models.Category) ([]models.MenuItem, error) {
	filter := bson.M{"category": cat, "is_active": true}
	cur, err := r.col.Find(ctx, filter, options.Find().SetSort(bson.D{
		{Key: "order", Value: 1},
		{Key: "_id", Value: 1},
	}))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var items []models.MenuItem
	if err := cur.All(ctx, &items); err != nil {
		return nil, err
	}
	if items == nil {
		items = []models.MenuItem{}
	}
	return items, nil
}

// Get returns a single item by its hex ID.
func (r *MenuItemRepo) Get(ctx context.Context, id string) (models.MenuItem, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return models.MenuItem{}, ErrNotFound
	}
	var item models.MenuItem
	if err := r.col.FindOne(ctx, bson.M{"_id": oid}).Decode(&item); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return models.MenuItem{}, ErrNotFound
		}
		return models.MenuItem{}, err
	}
	return item, nil
}

// Create inserts a new menu item.
func (r *MenuItemRepo) Create(ctx context.Context, item *models.MenuItem) error {
	// Generate the _id up front so the returned item carries the real ID and we
	// never insert a zero ObjectID (which would collide on the next insert).
	if item.ID.IsZero() {
		item.ID = primitive.NewObjectID()
	}
	now := time.Now().UTC()
	if item.CreatedAt.IsZero() {
		item.CreatedAt = now
	}
	item.UpdatedAt = now
	if _, err := r.col.InsertOne(ctx, item); err != nil {
		return err
	}
	return nil
}

// Update applies a partial update (bson.M) to the item with the given id.
func (r *MenuItemRepo) Update(ctx context.Context, id string, update bson.M) error {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return ErrNotFound
	}
	if _, ok := update["$set"]; ok {
		// merge updated_at into the existing $set to avoid clobbering other fields.
		set := update["$set"].(bson.M)
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

// Delete removes a menu item by id.
func (r *MenuItemRepo) Delete(ctx context.Context, id string) error {
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

// Count returns the total number of menu items.
func (r *MenuItemRepo) Count(ctx context.Context) (int64, error) {
	return r.col.CountDocuments(ctx, bson.M{})
}

// InsertMany inserts several items at once (used for seeding).
func (r *MenuItemRepo) InsertMany(ctx context.Context, items []models.MenuItem) error {
	if len(items) == 0 {
		return nil
	}
	docs := make([]any, len(items))
	now := time.Now().UTC()
	for i := range items {
		if items[i].ID.IsZero() {
			items[i].ID = primitive.NewObjectID()
		}
		if items[i].CreatedAt.IsZero() {
			items[i].CreatedAt = now
		}
		items[i].UpdatedAt = now
		docs[i] = items[i]
	}
	_, err := r.col.InsertMany(ctx, docs)
	return err
}
