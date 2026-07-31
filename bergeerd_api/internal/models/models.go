package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Category is the grouping a menu item belongs to, e.g. burgers, fries, drinks.
// NOTE: This is the historical enum kept for backwards compatibility / seeding.
// Categories are now a first-class dynamic entity (see CategoryDoc) manageable
// via the admin panel, so the website's section titles come from the database
// rather than being hardcoded.
type Category string

const (
	CategoryBurgers    Category = "burgers"
	CategorySandwiches Category = "sandwiches"
	CategoryFries      Category = "fries"
	CategoryToppings   Category = "toppings"
	CategoryDrinks     Category = "drinks"
)

// CategoryDoc is a dynamic category stored in the `categories` collection.
// `slug` is the stable key referenced by menu items (e.g. "burgers"); `title`
// is the human-friendly Persian label shown as a section heading on the site.
type CategoryDoc struct {
	ID        primitive.ObjectID `json:"id"         bson:"_id"`
	Slug      string             `json:"slug"      bson:"slug"`
	Title     string             `json:"title"     bson:"title"`
	Order     int                `json:"order"     bson:"order"`
	IsActive  bool               `json:"is_active" bson:"is_active"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time          `json:"updated_at" bson:"updated_at"`
}

// CategoryInput is the validated payload for create/update of a category.
type CategoryInput struct {
	Slug     *string `json:"slug"`
	Title    *string `json:"title"`
	Order    *int    `json:"order"`
	IsActive *bool   `json:"is_active"`
}

// MenuItem is the central domain object managed by the admin panel and shown
// on the public website.
type MenuItem struct {
	ID          primitive.ObjectID `json:"id"            bson:"_id"`
	Name        string             `json:"name"          bson:"name"`
	Description string             `json:"description"   bson:"description"`
	Price       string             `json:"price"         bson:"price"`
	ImageURL    string             `json:"image_url"     bson:"image_url"`
	ImageAlt    string             `json:"image_alt"     bson:"image_alt"`
	Category    Category           `json:"category"      bson:"category"`
	Order       int                `json:"order"         bson:"order"`
	IsActive    bool               `json:"is_active"     bson:"is_active"`
	CreatedAt   time.Time          `json:"created_at"    bson:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"    bson:"updated_at"`
}

// MenuItemInput is the validated payload accepted by create/update endpoints.
// All fields are pointers so we can distinguish "not provided" from "cleared".
type MenuItemInput struct {
	Name        *string  `json:"name"`
	Description *string  `json:"description"`
	Price       *string  `json:"price"`
	ImageURL    *string  `json:"image_url"`
	ImageAlt    *string  `json:"image_alt"`
	Category    *string  `json:"category"`
	Order       *int     `json:"order"`
	IsActive    *bool    `json:"is_active"`
}

// Admin is the authenticated user for the admin panel.
type Admin struct {
	ID           primitive.ObjectID `json:"id"             bson:"_id"`
	Username     string             `json:"username"       bson:"username"`
	PasswordHash string             `json:"-"              bson:"password_hash"`
	CreatedAt    time.Time          `json:"created_at"     bson:"created_at"`
	UpdatedAt    time.Time          `json:"updated_at"     bson:"updated_at"`
}

// LoginRequest is the payload for POST /api/auth/login.
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse is returned after a successful login.
type LoginResponse struct {
	Token string `json:"token"`
	Admin struct {
		Username string `json:"username"`
	} `json:"admin"`
}
