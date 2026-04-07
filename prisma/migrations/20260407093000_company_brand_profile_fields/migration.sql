-- Extend companies profile fields for brand public profile editing
ALTER TABLE companies
  MODIFY COLUMN logo_url MEDIUMTEXT NULL,
  ADD COLUMN cover_image_url MEDIUMTEXT NULL AFTER logo_url,
  ADD COLUMN instagram_handle VARCHAR(120) NULL AFTER website,
  ADD COLUMN brand_categories TEXT NULL AFTER instagram_handle,
  ADD COLUMN brand_tagline VARCHAR(160) NULL AFTER brand_categories,
  ADD COLUMN ships_worldwide BOOLEAN NOT NULL DEFAULT FALSE AFTER brand_tagline;
