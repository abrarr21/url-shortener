package shortener

import (
	"context"
	"errors"

	"github.com/abrarr21/url-shortener/internal/database/generated"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

var ErrNotFound = errors.New("short code not found")

type Service struct {
	snowflake *SnowflakeGenerator
	queries   generated.Querier
}

func NewService(snowflake *SnowflakeGenerator, queries generated.Querier) *Service {
	return &Service{
		snowflake: snowflake,
		queries:   queries,
	}
}

func (s *Service) Shorten(ctx context.Context, longUrl string) (string, error) {
	id, err := s.snowflake.NextID()
	if err != nil {
		return "", err
	}

	shortcode := toBase62(id)

	s.queries.CreateURL(ctx, generated.CreateURLParams{
		ID:        id,
		ShortCode: shortcode,
		LongUrl:   longUrl,
		UserID:    pgtype.Int8{Valid: false},
	})

	return shortcode, nil
}

func (s *Service) Lookup(ctx context.Context, shortcode string) (string, error) {
	url, err := s.queries.GetUrlByShortCode(ctx, shortcode)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", ErrNotFound
		}
		return "", nil
	}

	return url.LongUrl, nil
}
