package repository

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"bergeerd-api/internal/models"
)

// AdminRepo persists admin accounts.
type AdminRepo struct {
	col *mongo.Collection
}

// NewAdminRepo returns a repository backed by the given database.
func NewAdminRepo(db *mongo.Database) *AdminRepo {
	return &AdminRepo{col: db.Collection("admins")}
}

// EnsureIndexes creates a unique index on username.
func (r *AdminRepo) EnsureIndexes(ctx context.Context) error {
	_, err := r.col.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "username", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	return err
}

// FindByUsername loads an admin by username.
func (r *AdminRepo) FindByUsername(ctx context.Context, username string) (models.Admin, error) {
	var admin models.Admin
	if err := r.col.FindOne(ctx, bson.M{"username": username}).Decode(&admin); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return models.Admin{}, ErrNotFound
		}
		return models.Admin{}, err
	}
	return admin, nil
}

// Count returns the number of admin accounts (used to decide seeding).
func (r *AdminRepo) Count(ctx context.Context) (int64, error) {
	return r.col.CountDocuments(ctx, bson.M{})
}

// Create inserts a new admin account.
func (r *AdminRepo) Create(ctx context.Context, admin *models.Admin) error {
	res, err := r.col.InsertOne(ctx, admin)
	if err != nil {
		return err
	}
	admin.ID = res.InsertedID.(primitive.ObjectID)
	return nil
}
