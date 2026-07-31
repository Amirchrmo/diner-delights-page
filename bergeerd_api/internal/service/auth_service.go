package service

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"bergeerd-api/internal/auth"
	"bergeerd-api/internal/models"
	"bergeerd-api/internal/repository"
)

// ErrInvalidCredentials is returned when login fails.
var ErrInvalidCredentials = errors.New("invalid username or password")

// AuthService handles admin authentication and seeding.
type AuthService struct {
	adminRepo *repository.AdminRepo
	jwt       *auth.JWTService
}

// NewAuthService wires the auth service with its dependencies.
func NewAuthService(adminRepo *repository.AdminRepo, jwt *auth.JWTService) *AuthService {
	return &AuthService{adminRepo: adminRepo, jwt: jwt}
}

// Login validates credentials and returns a signed JWT.
func (s *AuthService) Login(ctx context.Context, username, password string) (models.LoginResponse, error) {
	admin, err := s.adminRepo.FindByUsername(ctx, username)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return models.LoginResponse{}, ErrInvalidCredentials
		}
		return models.LoginResponse{}, err
	}
	if !auth.CheckPassword(admin.PasswordHash, password) {
		return models.LoginResponse{}, ErrInvalidCredentials
	}

	token, err := s.jwt.Generate(admin.Username)
	if err != nil {
		return models.LoginResponse{}, err
	}

	resp := models.LoginResponse{Token: token}
	resp.Admin.Username = admin.Username
	return resp, nil
}

// SeedAdminIfEmpty creates the default admin account when none exist.
func (s *AuthService) SeedAdminIfEmpty(ctx context.Context, username, password string) error {
	count, err := s.adminRepo.Count(ctx)
	if err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	hash, err := auth.HashPassword(password)
	if err != nil {
		return err
	}
	now := time.Now().UTC()
	return s.adminRepo.Create(ctx, &models.Admin{
		ID:           primitive.NewObjectID(),
		Username:     username,
		PasswordHash: hash,
		CreatedAt:    now,
		UpdatedAt:    now,
	})
}
