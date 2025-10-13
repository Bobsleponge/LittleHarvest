#!/bin/bash

# Database Migration Script
# Exports data from SQLite and imports to PostgreSQL

echo "🚀 Starting database migration from SQLite to PostgreSQL..."

# Create export directory
mkdir -p ./migration-data

# Export all tables to JSON
echo "📊 Exporting data from SQLite..."

sqlite3 prisma/dev.db << 'EOF'
.mode json
.output ./migration-data/users.json
SELECT * FROM User;

.output ./migration-data/profiles.json
SELECT * FROM Profile;

.output ./migration-data/childProfiles.json
SELECT * FROM ChildProfile;

.output ./migration-data/addresses.json
SELECT * FROM Address;

.output ./migration-data/ageGroups.json
SELECT * FROM AgeGroup;

.output ./migration-data/textures.json
SELECT * FROM Texture;

.output ./migration-data/portionSizes.json
SELECT * FROM PortionSize;

.output ./migration-data/allergens.json
SELECT * FROM Allergen;

.output ./migration-data/dietaryRequirements.json
SELECT * FROM DietaryRequirement;

.output ./migration-data/products.json
SELECT * FROM Product;

.output ./migration-data/productAllergens.json
SELECT * FROM ProductAllergen;

.output ./migration-data/productDietaryRequirements.json
SELECT * FROM ProductDietaryRequirement;

.output ./migration-data/prices.json
SELECT * FROM Price;

.output ./migration-data/packages.json
SELECT * FROM Package;

.output ./migration-data/packageItems.json
SELECT * FROM PackageItem;

.output ./migration-data/carts.json
SELECT * FROM Cart;

.output ./migration-data/cartItems.json
SELECT * FROM CartItem;

.output ./migration-data/orders.json
SELECT * FROM Order;

.output ./migration-data/orderItems.json
SELECT * FROM OrderItem;

.output ./migration-data/coupons.json
SELECT * FROM Coupon;

.output ./migration-data/ingredients.json
SELECT * FROM Ingredient;

.output ./migration-data/inventories.json
SELECT * FROM Inventory;

.output ./migration-data/securityEvents.json
SELECT * FROM SecurityEvent;

.output ./migration-data/securityAlerts.json
SELECT * FROM SecurityAlert;

.output ./migration-data/blockedIPs.json
SELECT * FROM BlockedIP;

.output ./migration-data/auditLogs.json
SELECT * FROM AuditLog;

.output ./migration-data/storeSettings.json
SELECT * FROM StoreSettings;

.output ./migration-data/settingsHistory.json
SELECT * FROM SettingsHistory;

.output ./migration-data/securityIncidents.json
SELECT * FROM SecurityIncident;

.output ./migration-data/securityIncidentComments.json
SELECT * FROM SecurityIncidentComment;

.output ./migration-data/securityPlaybooks.json
SELECT * FROM SecurityPlaybook;

.output ./migration-data/securityThreatIntelligence.json
SELECT * FROM SecurityThreatIntelligence;

.quit
EOF

echo "✅ Data export completed"

# Count records
echo "📊 Record counts:"
for file in ./migration-data/*.json; do
    table=$(basename "$file" .json)
    count=$(jq length "$file" 2>/dev/null || echo "0")
    echo "  $table: $count records"
done

echo "🎉 Migration data exported to ./migration-data/"
echo "Next step: Import data to PostgreSQL"
