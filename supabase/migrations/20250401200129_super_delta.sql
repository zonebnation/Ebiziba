/*
  # Fix Book Content URLs

  1. Changes
    - Update content_urls to include https:// prefix
    - Ensure all URLs are properly formatted
*/

-- Update existing book URLs to include https://
UPDATE books
SET content_url = CASE id
  WHEN '0ff9865d-86e8-4c58-8b74-060eb74552c5' THEN 'https://shahadah.ebizimbaobusilaamu.com'
  WHEN '52f5417f-75fd-4243-8c7e-c218c10b0d4d' THEN 'https://obuyonjo.ebizimbaobusilaamu.com'
  WHEN '535bc4ab-2a82-444f-aa0a-38a38235654b' THEN 'https://okuyamba.ebizimbaobusilaamu.com'
  WHEN '5d9f965e-a5fa-443c-85d9-ef3868b54ea0' THEN 'https://zaka.ebizimbaobusilaamu.com'
  WHEN '8906df17-68be-435b-92db-38abfe930c5d' THEN 'https://okusiiba.ebizimbaobusilaamu.com'
  WHEN 'b3b2ff09-de26-4d17-bb72-08f4b01779d6' THEN 'https://hijja.ebizimbaobusilaamu.com'
  WHEN 'bdd2d68d-01ae-44e1-a123-f9d03dd5153a' THEN 'https://esswala.ebizimbaobusilaamu.com'
END
WHERE id IN (
  '0ff9865d-86e8-4c58-8b74-060eb74552c5',
  '52f5417f-75fd-4243-8c7e-c218c10b0d4d',
  '535bc4ab-2a82-444f-aa0a-38a38235654b',
  '5d9f965e-a5fa-443c-85d9-ef3868b54ea0',
  '8906df17-68be-435b-92db-38abfe930c5d',
  'b3b2ff09-de26-4d17-bb72-08f4b01779d6',
  'bdd2d68d-01ae-44e1-a123-f9d03dd5153a'
);
