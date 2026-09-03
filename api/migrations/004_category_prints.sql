USE alliraa;

ALTER TABLE categories
  ADD COLUMN prints_json JSON NULL AFTER fabrics_json;
