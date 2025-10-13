-- Supabase Data Migration Script - Clean Version
-- Run this AFTER running supabase-schema-only.sql

-- Insert Users first (required for foreign keys)
INSERT INTO "User" ("id", "name", "email", "emailVerified", "image", "password", "role", "createdAt", "updatedAt") VALUES 
('cmgn8s08o002bjeskoqlfjqx6', 'Admin User', 'admin@tinytastes.co.za', '2025-10-12T05:06:33.143Z', NULL, '$2b$10$IK6GUybekqCQZeIOgYzH.eEG6ZjbLsrOVzVplDz3stajxTHI1Acw.', 'ADMIN', '2025-10-12T05:06:33.145Z', '2025-10-12T14:10:54.257Z'),
('cmgn8s08q002cjeskp52mwtbi', 'Manager User', 'manager@tinytastes.co.za', '2025-10-12T05:06:33.145Z', NULL, NULL, 'ADMIN', '2025-10-12T05:06:33.146Z', '2025-10-12T05:06:33.146Z'),
('cmgn8s08s002hjesku355qsu2', 'Jane Smith', 'customer@example.com', '2025-10-12T05:06:33.148Z', NULL, NULL, 'CUSTOMER', '2025-10-12T05:06:33.148Z', '2025-10-12T05:06:33.148Z'),
('cmgn8s08s002ijesk4oljdwjr', 'John Doe', 'parent@example.com', '2025-10-12T05:06:33.148Z', NULL, NULL, 'CUSTOMER', '2025-10-12T05:06:33.148Z', '2025-10-12T05:06:33.149Z')
ON CONFLICT ("id") DO NOTHING;

-- Insert AgeGroups
INSERT INTO "AgeGroup" ("id", "name", "minMonths", "maxMonths", "createdAt", "updatedAt") VALUES 
('cmgn8s0100000jeskjux1uowr', '12-24 months', 12, 24, '2025-10-12T05:06:32.868Z', '2025-10-12T05:06:32.868Z'),
('cmgn8s0100003jesk7mbcxjkd', '24-48 months', 24, 48, '2025-10-12T05:06:32.868Z', '2025-10-12T05:06:32.868Z'),
('cmgn8s0100001jeskej8ffhhi', '6-8 months', 6, 8, '2025-10-12T05:06:32.868Z', '2025-10-12T05:06:32.868Z'),
('cmgn8s0100002jeskwrml9pbg', '9-12 months', 9, 12, '2025-10-12T05:06:32.868Z', '2025-10-12T05:06:32.868Z')
ON CONFLICT ("id") DO NOTHING;

-- Insert Textures
INSERT INTO "Texture" ("id", "name", "createdAt", "updatedAt") VALUES 
('cmgn8s01q0004jeskhqomfmzv', 'Puree', '2025-10-12T05:06:32.895Z', '2025-10-12T05:06:32.895Z'),
('cmgn8s01q0006jeske13kqkju', 'Toddler', '2025-10-12T05:06:32.895Z', '2025-10-12T05:06:32.895Z'),
('cmgn8s01q0005jesk8yqwl5ld', 'Lumpy', '2025-10-12T05:06:32.895Z', '2025-10-12T05:06:32.895Z')
ON CONFLICT ("id") DO NOTHING;

-- Insert PortionSizes
INSERT INTO "PortionSize" ("id", "name", "description", "measurement", "createdAt", "updatedAt") VALUES 
('cmgn8s01w0007jesk5evpjy7z', '160g', NULL, '160g', '2025-10-12T05:06:32.900Z', '2025-10-12T05:06:32.900Z'),
('cmgn8s01w0009jeskd2ttum1m', '220g', NULL, '220g', '2025-10-12T05:06:32.900Z', '2025-10-12T05:06:32.900Z'),
('cmgn8s01w0008jeskcrb4vwke', '130g', NULL, '130g', '2025-10-12T05:06:32.900Z', '2025-10-12T05:06:32.900Z')
ON CONFLICT ("id") DO NOTHING;

-- Insert Products
INSERT INTO "Product" ("id", "name", "slug", "description", "ageGroupId", "textureId", "isActive", "imageUrl", "contains", "mayContain", "createdAt", "updatedAt") VALUES 
('cmgn8s022000ejeskfrbr3s9d', 'Chicken, Sweet Potato & Carrot', 'chicken-sweet-potato-carrot', 'Mild chicken with naturally sweet vegetables. A great first protein option for your baby.', 'cmgn8s0100001jeskej8ffhhi', 'cmgn8s01q0004jeskhqomfmzv', true, '/images/products/chicken-sweet-potato-carrot.jpg', 'chicken', '', '2025-10-12T05:06:32.906Z', '2025-10-12T05:06:32.906Z'),
('cmgn8s022000hjeskiodmeock', 'Turkey, Rice & Broccoli', 'turkey-rice-broccoli', 'Lean turkey with brown rice and nutrient-dense broccoli. A complete meal in one.', 'cmgn8s0100002jeskwrml9pbg', 'cmgn8s01q0005jesk8yqwl5ld', true, '/images/products/turkey-rice-broccoli.jpg', 'turkey', 'gluten', '2025-10-12T05:06:32.906Z', '2025-10-12T05:06:32.906Z'),
('cmgn8s022000ljeskyq34oi2n', 'Beef Stew with Mixed Vegetables', 'beef-stew-vegetables', 'Hearty beef stew with chunky vegetables. Perfect for toddlers who love texture.', 'cmgn8s0100000jeskjux1uowr', 'cmgn8s01q0006jeske13kqkju', true, '/images/products/beef-stew-vegetables.jpg', 'beef', 'gluten', '2025-10-12T05:06:32.906Z', '2025-10-12T05:06:32.906Z'),
('cmgn8s022000njeskdgzznh1w', 'Chicken Pasta Primavera', 'chicken-pasta-primitive', 'Tender chicken with pasta and fresh vegetables. A toddler favorite!', 'cmgn8s0100000jeskjux1uowr', 'cmgn8s01q0006jeske13kqkju', true, '/images/products/chicken-pasta-primitive.jpg', 'chicken,gluten', 'eggs', '2025-10-12T05:06:32.906Z', '2025-10-12T05:06:32.906Z'),
('cmgn8s022000fjeskjunynvr3', 'Beef & Butternut Lentil Puree', 'beef-butternut-lentil-puree', 'Nutritious puree with tender beef, sweet butternut squash, and protein-rich lentils. Perfect for introducing meat to your little one.', 'cmgn8s0100001jeskej8ffhhi', 'cmgn8s01q0004jeskhqomfmzv', true, '/images/products/beef-butternut-lentil.jpg', 'beef,lentils', 'gluten', '2025-10-12T05:06:32.906Z', '2025-10-12T05:06:32.906Z'),
('cmgn8s022000mjeskjko0m5vw', 'Lamb Mash with Potato & Peas', 'lamb-mash-potato-peas', 'Iron-rich lamb with creamy mashed potato and sweet peas. Perfect for growing appetites.', 'cmgn8s0100002jeskwrml9pbg', 'cmgn8s01q0005jesk8yqwl5ld', true, '/images/products/lamb-mash-potato-peas.jpg', 'lamb', 'milk', '2025-10-12T05:06:32.906Z', '2025-10-12T05:06:32.906Z'),
('cmgn8s022000gjesk2ivuv6kb', 'Fish & Vegetable Medley', 'fish-vegetable-medley', 'Omega-3 rich fish with a variety of vegetables. Excellent for brain development.', 'cmgn8s0100001jeskej8ffhhi', 'cmgn8s01q0004jeskhqomfmzv', true, '/images/products/fish-vegetable-medley.jpg', 'fish', 'milk', '2025-10-12T05:06:32.906Z', '2025-10-12T05:06:32.906Z')
ON CONFLICT ("id") DO NOTHING;

-- Insert Prices
INSERT INTO "Price" ("id", "productId", "portionSizeId", "amountZar", "isActive", "createdAt", "updatedAt") VALUES 
('cmgn8s03a000zjeskbe440xmn', 'cmgn8s022000fjeskjunynvr3', 'cmgn8s01w0008jeskcrb4vwke', 45, true, '2025-10-12T05:06:32.950Z', '2025-10-12T05:06:32.950Z'),
('cmgn8s03c0019jeskm6ok5cx6', 'cmgn8s022000hjeskiodmeock', 'cmgn8s01w0007jesk5evpjy7z', 55, true, '2025-10-12T05:06:32.952Z', '2025-10-12T05:06:32.952Z'),
('cmgn8s03c001bjesk3yw8n3ye', 'cmgn8s022000hjeskiodmeock', 'cmgn8s01w0009jeskd2ttum1m', 76, true, '2025-10-12T05:06:32.953Z', '2025-10-12T05:06:32.953Z'),
('cmgn8s03d001djesk66jodnly', 'cmgn8s022000ljeskyq34oi2n', 'cmgn8s01w0008jeskcrb4vwke', 45, true, '2025-10-12T05:06:32.954Z', '2025-10-12T05:06:32.954Z'),
('cmgn8s03a000tjesk8umse6i0', 'cmgn8s022000ejeskfrbr3s9d', 'cmgn8s01w0009jeskd2ttum1m', 76, true, '2025-10-12T05:06:32.951Z', '2025-10-12T05:06:32.951Z'),
('cmgn8s03f001hjesk7c1qk4px', 'cmgn8s022000gjesk2ivuv6kb', 'cmgn8s01w0008jeskcrb4vwke', 45, true, '2025-10-12T05:06:32.955Z', '2025-10-12T05:06:32.955Z'),
('cmgn8s03e001fjeskx1rndplg', 'cmgn8s022000ljeskyq34oi2n', 'cmgn8s01w0007jesk5evpjy7z', 55, true, '2025-10-12T05:06:32.955Z', '2025-10-12T05:06:32.955Z'),
('cmgn8s03g001ljeskpii17ujb', 'cmgn8s022000njeskdgzznh1w', 'cmgn8s01w0008jeskcrb4vwke', 45, true, '2025-10-12T05:06:32.957Z', '2025-10-12T05:06:32.957Z'),
('cmgn8s03f001jjeskzfrhsx7m', 'cmgn8s022000ljeskyq34oi2n', 'cmgn8s01w0009jeskd2ttum1m', 76, true, '2025-10-12T05:06:32.956Z', '2025-10-12T05:06:32.956Z'),
('cmgn8s03h001pjeskr6akro99', 'cmgn8s022000njeskdgzznh1w', 'cmgn8s01w0009jeskd2ttum1m', 76, true, '2025-10-12T05:06:32.958Z', '2025-10-12T05:06:32.958Z'),
('cmgn8s03i001rjeskqcq3tnmi', 'cmgn8s022000mjeskjko0m5vw', 'cmgn8s01w0008jeskcrb4vwke', 45, true, '2025-10-12T05:06:32.958Z', '2025-10-12T05:06:32.958Z'),
('cmgn8s03i001tjesk0zeraa3k', 'cmgn8s022000hjeskiodmeock', 'cmgn8s01w0008jeskcrb4vwke', 45, true, '2025-10-12T05:06:32.959Z', '2025-10-12T05:06:32.959Z'),
('cmgn8s03a000vjeskgxl32dkr', 'cmgn8s022000ejeskfrbr3s9d', 'cmgn8s01w0008jeskcrb4vwke', 45, true, '2025-10-12T05:06:32.951Z', '2025-10-12T05:06:32.951Z'),
('cmgn8s03h001njeskmtvww1k7', 'cmgn8s022000njeskdgzznh1w', 'cmgn8s01w0007jesk5evpjy7z', 55, true, '2025-10-12T05:06:32.957Z', '2025-10-12T05:06:32.957Z'),
('cmgn8s03b0013jeskdjevnpo3', 'cmgn8s022000gjesk2ivuv6kb', 'cmgn8s01w0007jesk5evpjy7z', 55, true, '2025-10-12T05:06:32.951Z', '2025-10-12T05:06:32.951Z'),
('cmgn8s03a000ujesk1q4fogjj', 'cmgn8s022000gjesk2ivuv6kb', 'cmgn8s01w0009jeskd2ttum1m', 76, true, '2025-10-12T05:06:32.951Z', '2025-10-12T05:06:32.951Z'),
('cmgn8s03a0010jeskw5h6ieq8', 'cmgn8s022000fjeskjunynvr3', 'cmgn8s01w0009jeskd2ttum1m', 76, true, '2025-10-12T05:06:32.950Z', '2025-10-12T05:06:32.950Z'),
('cmgn8s03b0015jeskbxo2acce', 'cmgn8s022000mjeskjko0m5vw', 'cmgn8s01w0009jeskd2ttum1m', 76, true, '2025-10-12T05:06:32.951Z', '2025-10-12T05:06:32.951Z'),
('cmgn8s03b0017jesk4w4suaal', 'cmgn8s022000mjeskjko0m5vw', 'cmgn8s01w0007jesk5evpjy7z', 55, true, '2025-10-12T05:06:32.951Z', '2025-10-12T05:06:32.951Z'),
('cmgn8s03a0011jesk0gear3rm', 'cmgn8s022000fjeskjunynvr3', 'cmgn8s01w0007jesk5evpjy7z', 55, true, '2025-10-12T05:06:32.950Z', '2025-10-12T05:06:32.950Z'),
('cmgn8s03a000sjeskuuuey2x8', 'cmgn8s022000ejeskfrbr3s9d', 'cmgn8s01w0007jesk5evpjy7z', 55, true, '2025-10-12T05:06:32.951Z', '2025-10-12T05:06:32.951Z')
ON CONFLICT ("id") DO NOTHING;

-- Insert Packages
INSERT INTO "Package" ("id", "name", "slug", "description", "isActive", "createdAt", "updatedAt") VALUES 
('cmgn8s06n001ujesk3oajvkwa', 'Weekly Stage Pack (12-24 months)', 'weekly-stage-pack-12-24m', 'A week''s worth of toddler meals perfect for 12-24 month olds. Includes 7 different meals.', true, '2025-10-12T05:06:33.071Z', '2025-10-12T05:06:33.071Z'),
('cmgn8s06n001vjeskoxppa0nt', 'Weekly Stage Pack (6-8 months)', 'weekly-stage-pack-6-8m', 'A week''s worth of nutritious meals perfect for 6-8 month olds. Includes 7 different purees.', true, '2025-10-12T05:06:33.071Z', '2025-10-12T05:06:33.071Z'),
('cmgn8s06o001wjesk9q231sw1', 'Weekly Stage Pack (9-12 months)', 'weekly-stage-pack-9-12m', 'A week''s worth of lumpy textures perfect for 9-12 month olds. Includes 7 different meals.', true, '2025-10-12T05:06:33.071Z', '2025-10-12T05:06:33.071Z')
ON CONFLICT ("id") DO NOTHING;

-- Insert PackageItems
INSERT INTO "PackageItem" ("id", "packageId", "productId", "portionSizeId", "quantity", "createdAt", "updatedAt") VALUES 
('cmgn8s06r0022jeskeklalxj3', 'cmgn8s06o001wjesk9q231sw1', 'cmgn8s022000mjeskjko0m5vw', 'cmgn8s01w0007jesk5evpjy7z', 3, '2025-10-12T05:06:33.075Z', '2025-10-12T05:06:33.075Z'),
('cmgn8s06r0020jeskjq5pis3n', 'cmgn8s06n001vjeskoxppa0nt', 'cmgn8s022000ejeskfrbr3s9d', 'cmgn8s01w0008jeskcrb4vwke', 2, '2025-10-12T05:06:33.075Z', '2025-10-12T05:06:33.075Z'),
('cmgn8s06r0021jeskrq1xangl', 'cmgn8s06n001vjeskoxppa0nt', 'cmgn8s022000fjeskjunynvr3', 'cmgn8s01w0008jeskcrb4vwke', 3, '2025-10-12T05:06:33.075Z', '2025-10-12T05:06:33.075Z'),
('cmgn8s06r002ajesk6mwaremw', 'cmgn8s06n001ujesk3oajvkwa', 'cmgn8s022000njeskdgzznh1w', 'cmgn8s01w0009jeskd2ttum1m', 3, '2025-10-12T05:06:33.075Z', '2025-10-12T05:06:33.075Z'),
('cmgn8s06r0026jeskjl815d9s', 'cmgn8s06n001ujesk3oajvkwa', 'cmgn8s022000ljeskyq34oi2n', 'cmgn8s01w0009jeskd2ttum1m', 3, '2025-10-12T05:06:33.075Z', '2025-10-12T05:06:33.075Z'),
('cmgn8s06r0029jesk9fco0ath', 'cmgn8s06o001wjesk9q231sw1', 'cmgn8s022000hjeskiodmeock', 'cmgn8s01w0007jesk5evpjy7z', 3, '2025-10-12T05:06:33.075Z', '2025-10-12T05:06:33.075Z'),
('cmgn8s06r0025jeskudmqmwdl', 'cmgn8s06n001vjeskoxppa0nt', 'cmgn8s022000gjesk2ivuv6kb', 'cmgn8s01w0008jeskcrb4vwke', 2, '2025-10-12T05:06:33.075Z', '2025-10-12T05:06:33.075Z')
ON CONFLICT ("id") DO NOTHING;

-- Insert Profiles
INSERT INTO "Profile" ("id", "userId", "firstName", "lastName", "phone", "createdAt", "updatedAt") VALUES 
('cmgn8s08r002ejeskednv9cd2', 'cmgn8s08o002bjeskoqlfjqx6', 'Admin', 'User', '+27 82 123 4567', '2025-10-12T05:06:33.147Z', '2025-10-12T05:06:33.147Z'),
('cmgn8s08r002gjeskc40kr12w', 'cmgn8s08q002cjeskp52mwtbi', 'Manager', 'User', '+27 82 987 6543', '2025-10-12T05:06:33.148Z', '2025-10-12T05:06:33.148Z'),
('cmgn8s08t002kjeskjc6s19ld', 'cmgn8s08s002hjesku355qsu2', 'Jane', 'Smith', '+27 83 456 7890', '2025-10-12T05:06:33.150Z', '2025-10-12T05:06:33.150Z'),
('cmgn8s08v002sjeske18yet7f', 'cmgn8s08s002ijesk4oljdwjr', 'John', 'Doe', '+27 84 321 9876', '2025-10-12T05:06:33.152Z', '2025-10-12T05:06:33.152Z')
ON CONFLICT ("id") DO NOTHING;

-- Insert ChildProfiles
INSERT INTO "ChildProfile" ("id", "profileId", "name", "dateOfBirth", "gender", "allergies", "dietaryRequirements", "foodPreferences", "medicalNotes", "isActive", "createdAt", "updatedAt") VALUES 
('cmgn8s08u002mjeskjl64rhh2', 'cmgn8s08t002kjeskjc6s19ld', 'Emma', '2023-06-15', 'FEMALE', '["nuts","dairy"]', '["vegetarian"]', '{"likes":["fruits","vegetables"],"dislikes":["spicy foods"]}', NULL, true, '2025-10-12T05:06:33.150Z', '2025-10-12T05:06:33.150Z'),
('cmgn8s08u002ojeskeee6dx1y', 'cmgn8s08t002kjeskjc6s19ld', 'Sophie', '2022-08-20', 'FEMALE', '["shellfish","soy"]', '["halal"]', '{"likes":["chicken","rice","sweet vegetables"],"dislikes":["bitter vegetables","fish"]}', NULL, true, '2025-10-12T05:06:33.151Z', '2025-10-12T05:06:33.151Z'),
('cmgn8s08v002qjeskviv9810h', 'cmgn8s08t002kjeskjc6s19ld', 'Oliver', '2021-12-10', 'MALE', '["peanuts","wheat"]', '["gluten-free"]', '{"likes":["beef","pasta","cheese"],"dislikes":["green vegetables","spicy foods"]}', NULL, true, '2025-10-12T05:06:33.151Z', '2025-10-12T05:06:33.151Z'),
('cmgn8s08w002ujeskgkyj12k4', 'cmgn8s08v002sjeske18yet7f', 'Alex', '2023-03-10', 'MALE', '["eggs"]', '["gluten-free"]', '{"likes":["meat","vegetables"],"dislikes":["fruits"]}', NULL, true, '2025-10-12T05:06:33.152Z', '2025-10-12T05:06:33.152Z')
ON CONFLICT ("id") DO NOTHING;

-- Insert Cart (now that User exists)
INSERT INTO "Cart" ("id", "userId", "createdAt", "updatedAt") VALUES 
('cmgn8xcnd0002tjva2fqcr2w5', 'cmgn8s08o002bjeskoqlfjqx6', '2025-10-12T05:10:42.505Z', '2025-10-12T05:10:42.505Z')
ON CONFLICT ("id") DO NOTHING;

-- Insert StoreSettings
INSERT INTO "StoreSettings" ("id", "category", "key", "value", "description", "isActive", "updatedBy", "createdAt", "updatedAt") VALUES 
('cmgnsqbm6000012so9wec0sg0', 'general', 'storeName', '"Little Harvest"', NULL, true, 'system-seed', '2025-10-12T14:25:06.895Z', '2025-10-12T14:25:06.895Z'),
('cmgnsqbm9000112sotomwk4iq', 'general', 'storeDescription', '"Nutritious meals for little ones"', NULL, true, 'system-seed', '2025-10-12T14:25:06.897Z', '2025-10-12T14:25:06.897Z'),
('cmgnsqbm9000212soxz5xli08', 'general', 'storeEmail', '"info@littleharvest.co.za"', NULL, true, 'system-seed', '2025-10-12T14:25:06.898Z', '2025-10-12T14:25:06.898Z'),
('cmgnsqbma000312so3dsdvx9y', 'general', 'storePhone', '"+27 11 123 4567"', NULL, true, 'system-seed', '2025-10-12T14:25:06.898Z', '2025-10-12T14:25:06.898Z'),
('cmgnsqbma000412sowl42g2x2', 'general', 'storeAddress', '"123 Main Street, Johannesburg, South Africa"', NULL, true, 'system-seed', '2025-10-12T14:25:06.899Z', '2025-10-12T14:25:06.899Z'),
('cmgnsqbmb000512so7rn9scit', 'business', 'currency', '"ZAR"', NULL, true, 'system-seed', '2025-10-12T14:25:06.900Z', '2025-10-12T14:25:06.900Z'),
('cmgnsqbmc000612soh2okkvxx', 'business', 'timezone', '"Africa/Johannesburg"', NULL, true, 'system-seed', '2025-10-12T14:25:06.900Z', '2025-10-12T14:25:06.900Z'),
('cmgnsqbmc000712sof02d7fg0', 'business', 'language', '"en"', NULL, true, 'system-seed', '2025-10-12T14:25:06.901Z', '2025-10-12T14:25:06.901Z'),
('cmgnsqbmd000812som7s8kbpw', 'delivery', 'deliveryRadius', '15', NULL, true, 'system-seed', '2025-10-12T14:25:06.901Z', '2025-10-12T14:25:06.901Z'),
('cmgnsqbmd000912sobu95pw9j', 'delivery', 'freeDeliveryThreshold', '200', NULL, true, 'system-seed', '2025-10-12T14:25:06.902Z', '2025-10-12T14:25:06.902Z'),
('cmgnsqbme000a12soe3fso9zf', 'delivery', 'deliveryFee', '25', NULL, true, 'system-seed', '2025-10-12T14:25:06.902Z', '2025-10-12T14:25:06.902Z'),
('cmgnsqbme000b12sori2orqmo', 'delivery', 'sameDayDelivery', 'false', NULL, true, 'system-seed', '2025-10-12T14:25:06.902Z', '2025-10-12T14:25:06.902Z'),
('cmgnsqbme000c12so6nmlsefo', 'payment', 'acceptCashOnDelivery', 'true', NULL, true, 'system-seed', '2025-10-12T14:25:06.903Z', '2025-10-12T14:25:06.903Z'),
('cmgnsqbmf000d12sokng2t758', 'payment', 'acceptCardPayment', 'true', NULL, true, 'system-seed', '2025-10-12T14:25:06.903Z', '2025-10-12T14:25:06.903Z'),
('cmgnsqbmg000e12soxj8fesb1', 'payment', 'paymentGateway', '"peach"', NULL, true, 'cmgn8s08o002bjeskoqlfjqx6', '2025-10-12T14:25:06.904Z', '2025-10-12T16:11:26.437Z'),
('cmgnsqbmg000f12soonn33n6q', 'notifications', 'emailNotifications', 'true', NULL, true, 'system-seed', '2025-10-12T14:25:06.905Z', '2025-10-12T14:25:06.905Z'),
('cmgnsqbmg000g12so4qtqg03f', 'notifications', 'smsNotifications', 'false', NULL, true, 'system-seed', '2025-10-12T14:25:06.905Z', '2025-10-12T14:25:06.905Z'),
('cmgnsqbmh000h12sow0mz0ogz', 'notifications', 'orderConfirmations', 'true', NULL, true, 'system-seed', '2025-10-12T14:25:06.905Z', '2025-10-12T14:25:06.905Z'),
('cmgnsqbmh000i12sob1hqmnzn', 'notifications', 'deliveryUpdates', 'true', NULL, true, 'system-seed', '2025-10-12T14:25:06.906Z', '2025-10-12T14:25:06.906Z'),
('cmgnsqbmi000j12so6d1ae13p', 'notifications', 'marketingEmails', 'false', NULL, true, 'system-seed', '2025-10-12T14:25:06.906Z', '2025-10-12T14:25:06.906Z'),
('cmgnsqbmi000k12so8n1gt2as', 'security', 'twoFactorAuth', 'false', NULL, true, 'system-seed', '2025-10-12T14:25:06.907Z', '2025-10-12T14:25:06.907Z'),
('cmgnsqbmi000l12soelxtycai', 'security', 'sessionTimeout', '60', NULL, true, 'system-seed', '2025-10-12T14:25:06.907Z', '2025-10-12T14:25:06.907Z'),
('cmgnsqbmj000m12soileh73pw', 'security', 'passwordPolicy', '"strong"', NULL, true, 'system-seed', '2025-10-12T14:25:06.907Z', '2025-10-12T14:25:06.907Z'),
('cmgnsqbmj000n12so1tc67ftp', 'security', 'loginAttempts', '5', NULL, true, 'system-seed', '2025-10-12T14:25:06.908Z', '2025-10-12T14:25:06.908Z'),
('cmgnsngeq000012vhqbsd9e5i', 'system', 'maintenanceMode', 'false', 'Temporarily disable public access to the site for maintenance', true, 'system-seed', '2025-10-12T14:22:53.138Z', '2025-10-12T14:25:06.907Z'),
('cmgnsngew000112vhxy4kl6jx', 'system', 'debugMode', 'false', 'Enable detailed error logging and debugging information', true, 'system-seed', '2025-10-12T14:22:53.144Z', '2025-10-12T14:25:06.908Z'),
('cmgnsngew000212vhow94vuuj', 'system', 'logLevel', '"info"', 'Set the minimum level of log messages to record', true, 'system-seed', '2025-10-12T14:22:53.145Z', '2025-10-12T14:25:06.908Z'),
('cmgnsngey000412vh7jome6pb', 'system', 'rateLimiting', 'true', 'Enable API rate limiting to prevent abuse and protect against DDoS attacks', true, 'system-seed', '2025-10-12T14:22:53.146Z', '2025-10-12T14:25:06.909Z'),
('cmgnsngey000512vhpjqtfrsp', 'system', 'backupFrequency', '"daily"', 'How often to automatically backup your database and files', true, 'system-seed', '2025-10-12T14:22:53.147Z', '2025-10-12T14:25:06.909Z'),
('cmgnsngez000612vhni0g86zu', 'system', 'backupRetention', '30', 'How long to keep backup files before automatically deleting them', true, 'system-seed', '2025-10-12T14:22:53.147Z', '2025-10-12T14:25:06.910Z'),
('cmgnsngf2000c12vhi45av18u', 'system', 'cacheDuration', '15', 'How long to cache API responses and static content', true, 'system-seed', '2025-10-12T14:22:53.150Z', '2025-10-12T14:25:06.912Z'),
('cmgnsngf2000d12vhx4z7jdyu', 'system', 'dbPoolSize', '10', 'Number of concurrent database connections', true, 'system-seed', '2025-10-12T14:22:53.151Z', '2025-10-12T14:25:06.912Z'),
('cmgnsngf2000e12vhh20pvpaw', 'system', 'maxFileSize', '10', 'Maximum size for file uploads in MB', true, 'system-seed', '2025-10-12T14:22:53.151Z', '2025-10-12T14:25:06.913Z'),
('cmgnsyt6z0000cnymg2oas01n', 'security', 'dataEncryption', 'true', 'Encrypt sensitive data stored in the database', true, 'security-seed', '2025-10-12T14:31:42.924Z', '2025-10-12T14:31:42.924Z'),
('cmgnsyt720001cnyml92uyybk', 'security', 'dataRetentionDays', '365', 'How long to keep user data before automatic deletion', true, 'security-seed', '2025-10-12T14:31:42.927Z', '2025-10-12T14:31:42.927Z'),
('cmgnsyt730002cnymi6kszha1', 'security', 'auditLogging', 'true', 'Log all security-related events', true, 'security-seed', '2025-10-12T14:31:42.927Z', '2025-10-12T14:31:42.927Z'),
('cmgnsyt730003cnymnqm35uac', 'security', 'allowRegistration', 'true', 'Allow new users to create accounts', true, 'security-seed', '2025-10-12T14:31:42.928Z', '2025-10-12T14:31:42.928Z'),
('cmgnsyt740004cnymjly9fkig', 'security', 'requireEmailVerification', 'true', 'Require users to verify their email address', true, 'security-seed', '2025-10-12T14:31:42.928Z', '2025-10-12T14:31:42.928Z'),
('cmgnsyt740005cnymvu3415zr', 'security', 'userIpWhitelist', '""', 'Restrict user access to specific IP addresses', true, 'security-seed', '2025-10-12T14:31:42.929Z', '2025-10-12T14:31:42.929Z'),
('cmgnt4ol10000kr4zmnqygq6i', 'security', 'passwordMinLength', '8', 'Minimum password length for user accounts', true, 'security-migration', '2025-10-12T14:36:16.885Z', '2025-10-12T14:36:16.885Z'),
('cmgnt4ol60001kr4zoy3jxtbv', 'security', 'passwordRequireSpecial', 'true', 'Require special characters in passwords', true, 'security-migration', '2025-10-12T14:36:16.890Z', '2025-10-12T14:36:16.890Z'),
('cmgnt4ol80002kr4zv5ybs2dl', 'security', 'passwordRequireNumbers', 'true', 'Require numbers in passwords', true, 'security-migration', '2025-10-12T14:36:16.892Z', '2025-10-12T14:36:16.892Z'),
('cmgnt4ola0003kr4z6x8rzq9q', 'security', 'require2FA', 'false', 'Require admin users to use 2FA for enhanced security', true, 'security-migration', '2025-10-12T14:36:16.894Z', '2025-10-12T14:36:16.894Z'),
('cmgnt4olb0004kr4z1w1kidl1', 'security', 'adminIpWhitelist', '""', 'Restrict admin access to specific IP addresses', true, 'security-migration', '2025-10-12T14:36:16.896Z', '2025-10-12T14:36:16.896Z'),
('cmgntc3vr0000rmsab9otd22d', 'notifications', 'smsDeliveryAlerts', 'false', 'Send SMS when orders are delivered or if there are delivery issues', true, 'notification-seed', '2025-10-12T14:42:03.303Z', '2025-10-12T14:42:03.303Z'),
('cmgntc3vu0001rmsad1wqq59t', 'notifications', 'smsOrderConfirmations', 'false', 'Send SMS confirmation for high-value orders or urgent deliveries', true, 'notification-seed', '2025-10-12T14:42:03.306Z', '2025-10-12T14:42:03.306Z'),
('cmgntc3vv0002rmsat0q4zvk5', 'notifications', 'newOrderAlerts', 'true', 'Receive immediate notifications when new orders are placed', true, 'notification-seed', '2025-10-12T14:42:03.307Z', '2025-10-12T14:42:03.307Z'),
('cmgntc3vv0003rmsanjkpg9s6', 'notifications', 'lowStockAlerts', 'true', 'Get notified when product inventory falls below threshold levels', true, 'notification-seed', '2025-10-12T14:42:03.308Z', '2025-10-12T14:42:03.308Z'),
('cmgntc3vw0004rmsasffqzboj', 'notifications', 'paymentIssueAlerts', 'true', 'Receive alerts for failed payments, refunds, or payment processing errors', true, 'notification-seed', '2025-10-12T14:42:03.308Z', '2025-10-12T14:42:03.308Z'),
('cmgntc3vw0005rmsa8szs4619', 'notifications', 'systemAlerts', 'true', 'Get notified about system issues, maintenance windows, or security events', true, 'notification-seed', '2025-10-12T14:42:03.309Z', '2025-10-12T14:42:03.309Z')
ON CONFLICT ("id") DO NOTHING;

-- Insert SettingsHistory
INSERT INTO "SettingsHistory" ("id", "category", "key", "oldValue", "newValue", "changedBy", "changeReason", "createdAt") VALUES 
('cmgnwj23u0001p2lsvbvs4cdq', 'payment', 'bulk_update', NULL, '["paymentGateway"]', 'cmgn8s08o002bjeskoqlfjqx6', 'Updated 1 payment settings', '2025-10-12T16:11:26.442Z')
ON CONFLICT ("id") DO NOTHING;

-- Test the migration
SELECT 'Data migration completed successfully!' as status;
