USE alliraa;

ALTER TABLE categories
  ADD COLUMN fabrics_json JSON NULL AFTER description;
