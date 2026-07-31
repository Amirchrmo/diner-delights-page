package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTService issues and validates JWT tokens for the admin panel.
type JWTService struct {
	secret    []byte
	expHours  int
	issuer    string
}

// NewJWTService creates a JWT service with the given secret and expiry.
func NewJWTService(secret string, expHours int) *JWTService {
	return &JWTService{
		secret:   []byte(secret),
		expHours: expHours,
		issuer:   "bergeerd-api",
	}
}

// Claims is the custom JWT claims payload.
type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// Generate creates a signed token for the given admin username.
func (s *JWTService) Generate(username string) (string, error) {
	now := time.Now().UTC()
	claims := Claims{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    s.issuer,
			Subject:   username,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(time.Duration(s.expHours) * time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secret)
}

// Validate parses and validates a token, returning its claims.
func (s *JWTService) Validate(tokenStr string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return s.secret, nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}
