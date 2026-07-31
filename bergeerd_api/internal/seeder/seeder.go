package seeder

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"bergeerd-api/internal/models"
	"bergeerd-api/internal/storage"
)

// DefaultCategories are the seed categories, ordered as they should appear on
// the website. Slug matches the historical enum so existing menu items keep
// working after migration; title is the Persian section heading.
func DefaultCategories() []models.CategoryDoc {
	return []models.CategoryDoc{
		{Slug: "burgers", Title: "برگرها", Order: 1, IsActive: true},
		{Slug: "sandwiches", Title: "ساندویچ‌ها", Order: 2, IsActive: true},
		{Slug: "fries", Title: "سیب‌زمینی", Order: 3, IsActive: true},
		{Slug: "toppings", Title: "میتونی اضافه کنی...", Order: 4, IsActive: true},
		{Slug: "drinks", Title: "نوشیدنی‌ها", Order: 5, IsActive: true},
	}
}

// seedItem pairs a menu item with the local image file used to seed it.
type seedItem struct {
	models.MenuItem
	imageFile string
}

// defaultSeed mirrors the existing static menu on bergeerd.ir so that switching
// to the dynamic API preserves the current content. Prices are kept in Persian
// digit strings exactly as they appear on the live site.
func defaultSeed() []seedItem {
	return []seedItem{
		// ---- Burgers ----
		{models.MenuItem{Name: "کلاسیک برگرد", Description: "۱۳۰ گرم گوشت گوساله آبدار با کاهو تازه،پیاز، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی.", Price: "۵۹۰", ImageAlt: "برگر کلاسیک با مخلفات تازه", Category: models.CategoryBurgers, Order: 1, IsActive: true}, "real-classic.jpg"},
		{models.MenuItem{Name: "کارامل برگرد", Description: "۱۳۰ گرم گوشت گوساله آبدار با پیاز کاراملی، کاهو تازه، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی.", Price: "۶۶۰", ImageAlt: "برگر کارامل با مخلفات تازه", Category: models.CategoryBurgers, Order: 2, IsActive: true}, "real-karamel.jpg"},
		{models.MenuItem{Name: "اسپایسی برگرد", Description: "۱۳۰ گرم گوشت گوساله آبدار با هالوپینو تند، کاهو تازه، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی.", Price: "۶۴۰", ImageAlt: "برگر اسپایسی تند", Category: models.CategoryBurgers, Order: 3, IsActive: true}, "real-spoicy.jpg"},
		{models.MenuItem{Name: "چیز برگرد", Description: "۱۳۰ گرم گوشت گوساله آبدار با دو ورق پنیر چدار ذوب شده، کاهو تازه، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی.", Price: "۶۶۰", ImageAlt: "چیزبرگر با پنیر ذوب شده", Category: models.CategoryBurgers, Order: 4, IsActive: true}, "real-chiz.jpg"},
		{models.MenuItem{Name: "ماشروم برگرد", Description: "۱۳۰ گرم گوشت گوساله آبدار با سس قارچ، کاهو تازه، گوجه،خیارشور و پیازچه روی نان کره ای به همراه سیب زمینی.", Price: "۶۹۰", ImageAlt: "ماشروم برگر با قارچ تازه", Category: models.CategoryBurgers, Order: 5, IsActive: true}, "real-mashroom.jpg"},
		{models.MenuItem{Name: "دودی برگرد", Description: "۱۳۰ گرم گوشت گوساله آبدار با دو ورق پنیر دودی، کاهو تازه،پاپریکای کبابی، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی.", Price: "۶۹۰", ImageAlt: "برگر دودی با طعم باربیکیو", Category: models.CategoryBurgers, Order: 6, IsActive: true}, "real-doody.jpg"},
		{models.MenuItem{Name: "محلی برگرد", Description: "۱۳۰ گرم گوشت گوساله آبدار با پنیر لیقوان، ریحان تازه، گوجه و سس سیر روی نان کره ای به همراه سیب زمینی.", Price: "۶۶۰", ImageAlt: "برگر محلی با مواد محلی", Category: models.CategoryBurgers, Order: 7, IsActive: true}, "real-mahali.jpg"},
		{models.MenuItem{Name: "بیکن برگرد", Description: "۱۳۰ گرم گوشت گوساله آبدار با بیکن دودی، کاهو تازه،پیاز، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی", Price: "۷۲۰", ImageAlt: "برگر بیکن دودی", Category: models.CategoryBurgers, Order: 8, IsActive: true}, "real-beyken.jpg"},

		// ---- Sandwiches ----
		{models.MenuItem{Name: "ساندویچ مرغ", Description: "۱۲۰ گرم فیله مرغ با خیار، گوجه، ریحان تازه، و سس انبه و چیلی روی نان چاپاتا کره ای به همراه سیب زمینی.", Price: "۵۲۰", ImageAlt: "ساندویچ مرغ", Category: models.CategorySandwiches, Order: 1, IsActive: true}, "real-chiken.jpg"},

		// ---- Fries ----
		{models.MenuItem{Name: "سیب زمینی", Description: "سیب‌زمینی طلایی و ترد با ادویه برگرد.", Price: "۲۶۰", ImageAlt: "سیب‌زمینی طلایی ترد", Category: models.CategoryFries, Order: 1, IsActive: true}, "sibzamini.jpg"},

		// ---- Toppings ----
		{models.MenuItem{Name: "گوشت ۶۵ گرمی اضافه", Description: "", Price: "۱۴۰", ImageAlt: "تاپینگ اضافه", Category: models.CategoryToppings, Order: 1, IsActive: true}, "top.png"},
		{models.MenuItem{Name: "بیکن", Description: "", Price: "۱۲۰", ImageAlt: "بیکن", Category: models.CategoryToppings, Order: 2, IsActive: true}, "top.png"},
		{models.MenuItem{Name: "پیاز کاراملی", Description: "", Price: "۶۰", ImageAlt: "پیاز کاراملی", Category: models.CategoryToppings, Order: 3, IsActive: true}, "top.png"},
		{models.MenuItem{Name: "قارچ", Description: "", Price: "۶۰", ImageAlt: "قارچ", Category: models.CategoryToppings, Order: 4, IsActive: true}, "top.png"},
		{models.MenuItem{Name: "هالوپینو", Description: "", Price: "۵۰", ImageAlt: "هالوپینو", Category: models.CategoryToppings, Order: 5, IsActive: true}, "top.png"},
		{models.MenuItem{Name: "پنیر دودی", Description: "", Price: "۵۵", ImageAlt: "پنیر دودی", Category: models.CategoryToppings, Order: 6, IsActive: true}, "top.png"},
		{models.MenuItem{Name: "پنیر چدار", Description: "", Price: "۵۵", ImageAlt: "پنیر چدار", Category: models.CategoryToppings, Order: 7, IsActive: true}, "top.png"},
		{models.MenuItem{Name: "سس سیر", Description: "", Price: "۵۰", ImageAlt: "سس سیر", Category: models.CategoryToppings, Order: 8, IsActive: true}, "top.png"},
		{models.MenuItem{Name: "سس هالوپینو", Description: "", Price: "۵۰", ImageAlt: "سس هالوپینو", Category: models.CategoryToppings, Order: 9, IsActive: true}, "top.png"},
		{models.MenuItem{Name: "سس دودی", Description: "", Price: "۷۰", ImageAlt: "سس دودی", Category: models.CategoryToppings, Order: 10, IsActive: true}, "top.png"},
		{models.MenuItem{Name: "سس چیلی انبه", Description: "", Price: "۶۰", ImageAlt: "سس چیلی انبه", Category: models.CategoryToppings, Order: 11, IsActive: true}, "top.png"},

		// ---- Drinks ----
		{models.MenuItem{Name: "کولا", Description: "کولا با یخ.", Price: "۸۵", ImageAlt: "کولا خنک‌کننده با یخ", Category: models.CategoryDrinks, Order: 1, IsActive: true}, "cola.jpg"},
		{models.MenuItem{Name: "زیرو", Description: "کولا زیرو بدون قند با یخ.", Price: "۸۵", ImageAlt: "کولا زیرو بدون قند", Category: models.CategoryDrinks, Order: 2, IsActive: true}, "cola.jpg"},
		{models.MenuItem{Name: "فانتا", Description: "نوشابه پرتغالی به همراه یخ", Price: "۸۵", ImageAlt: "نوشابه پرتغالی تازه و خنک", Category: models.CategoryDrinks, Order: 3, IsActive: true}, "fanta.png"},
	}
}

// BuildSeedItems returns the default menu items, uploading images from
// imagesDir to MinIO when available. If imagesDir is empty or a file is
// missing, a placeholder URL is used so seeding never fails on data alone.
func BuildSeedItems(ctx context.Context, store *storage.MinioStorage, imagesDir string) []models.MenuItem {
	seed := defaultSeed()
	out := make([]models.MenuItem, 0, len(seed))

	for _, s := range seed {
		item := s.MenuItem
		item.ImageURL = resolveSeedImage(ctx, store, imagesDir, s.imageFile)
		out = append(out, item)
	}
	return out
}

// resolveSeedImage uploads a local image file when present, else falls back to
// a placeholder. Missing files are logged but never fatal.
func resolveSeedImage(ctx context.Context, store *storage.MinioStorage, imagesDir, file string) string {
	if imagesDir != "" && file != "" {
		path := filepath.Join(imagesDir, file)
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			f, err := os.Open(path)
			if err == nil {
				defer f.Close()
				res, err := store.UploadImage(ctx, f, info.Size(), file, contentTypeFor(file))
				if err == nil {
					return res.URL
				}
				log.Printf("seeder: upload failed for %s: %v", file, err)
			}
		}
	}
	// Fallback: a placeholder so the website still renders even without images.
	return fmt.Sprintf("%s/%s/placeholder.svg", store.PublicURL(), store.Bucket())
}

func contentTypeFor(name string) string {
	ext := strings.ToLower(filepath.Ext(name))
	switch ext {
	case ".png":
		return "image/png"
	case ".webp":
		return "image/webp"
	case ".gif":
		return "image/gif"
	case ".svg":
		return "image/svg+xml"
	default:
		return "image/jpeg"
	}
}
