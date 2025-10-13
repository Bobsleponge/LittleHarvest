CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "Order" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderNumber" VARCHAR(255) UNIQUE NOT NULL,
    "userId" VARCHAR(255) REFERENCES "User"(id),
    status VARCHAR(50) DEFAULT 'PENDING',
    "paymentStatus" VARCHAR(50) DEFAULT 'PENDING',
    "totalZar" INTEGER NOT NULL,
    notes TEXT,
    "deliveryDate" TIMESTAMP WITH TIME ZONE,
    "paymentDueDate" TIMESTAMP WITH TIME ZONE,
    "paidAt" TIMESTAMP WITH TIME ZONE,
    "addressId" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "OrderItem" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderId" UUID REFERENCES "Order"(id) ON DELETE CASCADE,
    "productId" VARCHAR(255) REFERENCES "Product"(id),
    "portionSizeId" VARCHAR(255) REFERENCES "PortionSize"(id),
    "packageId" VARCHAR(255) REFERENCES "Package"(id),
    quantity INTEGER NOT NULL,
    "unitPriceZar" INTEGER NOT NULL,
    "lineTotalZar" INTEGER NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Inventory" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "productId" VARCHAR(255) REFERENCES "Product"(id),
    "portionSizeId" VARCHAR(255) REFERENCES "PortionSize"(id),
    "currentStock" INTEGER DEFAULT 0,
    "reservedStock" INTEGER DEFAULT 0,
    "weeklyLimit" INTEGER DEFAULT 0,
    "lastRestocked" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("productId", "portionSizeId")
);

CREATE TABLE IF NOT EXISTS "Address" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "profileId" VARCHAR(255) REFERENCES "Profile"(id),
    type VARCHAR(50) DEFAULT 'DELIVERY',
    street VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    "postalCode" VARCHAR(255) NOT NULL,
    country VARCHAR(255) DEFAULT 'South Africa',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "CartItem" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "cartId" VARCHAR(255) REFERENCES "Cart"(id) ON DELETE CASCADE,
    "productId" VARCHAR(255) REFERENCES "Product"(id),
    "portionSizeId" VARCHAR(255) REFERENCES "PortionSize"(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    "childProfileId" VARCHAR(255) REFERENCES "ChildProfile"(id),
    "shoppingMode" VARCHAR(50) DEFAULT 'family',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("cartId", "productId", "portionSizeId")
);

CREATE TABLE IF NOT EXISTS "SecurityEvent" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" VARCHAR(255) REFERENCES "User"(id),
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'INFO',
    description TEXT,
    metadata JSONB,
    "ipAddress" INET,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_user_id ON "Order"("userId");
CREATE INDEX IF NOT EXISTS idx_order_status ON "Order"(status);
CREATE INDEX IF NOT EXISTS idx_order_created_at ON "Order"("createdAt");
CREATE INDEX IF NOT EXISTS idx_orderitem_order_id ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS idx_orderitem_product_id ON "OrderItem"("productId");
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON "Inventory"("productId");
CREATE INDEX IF NOT EXISTS idx_inventory_portion_size_id ON "Inventory"("portionSizeId");
CREATE INDEX IF NOT EXISTS idx_cartitem_cart_id ON "CartItem"("cartId");
CREATE INDEX IF NOT EXISTS idx_cartitem_product_id ON "CartItem"("productId");
CREATE INDEX IF NOT EXISTS idx_address_profile_id ON "Address"("profileId");
CREATE INDEX IF NOT EXISTS idx_security_event_user_id ON "SecurityEvent"("userId");
CREATE INDEX IF NOT EXISTS idx_security_event_type ON "SecurityEvent"(type);
CREATE INDEX IF NOT EXISTS idx_security_event_created_at ON "SecurityEvent"("createdAt");

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CartItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChildProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SecurityEvent" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON "User" FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON "User" FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own orders" ON "Order" FOR SELECT USING (
  auth.uid()::text = "userId"::text OR 
  EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND role = 'ADMIN')
);
CREATE POLICY "Users can create own orders" ON "Order" FOR INSERT WITH CHECK (auth.uid()::text = "userId"::text);
CREATE POLICY "Admins can update orders" ON "Order" FOR UPDATE USING (
  EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND role = 'ADMIN')
);

CREATE POLICY "Users can view own order items" ON "OrderItem" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "Order" WHERE id = "orderId" AND "userId"::text = auth.uid()::text) OR
  EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND role = 'ADMIN')
);
CREATE POLICY "Users can create order items" ON "OrderItem" FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM "Order" WHERE id = "orderId" AND "userId"::text = auth.uid()::text)
);

CREATE POLICY "Users can view own cart" ON "Cart" FOR SELECT USING (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can create own cart" ON "Cart" FOR INSERT WITH CHECK (auth.uid()::text = "userId"::text);

CREATE POLICY "Users can view own cart items" ON "CartItem" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "Cart" WHERE id::text = "cartId"::text AND "userId"::text = auth.uid()::text)
);
CREATE POLICY "Users can manage own cart items" ON "CartItem" FOR ALL USING (
  EXISTS (SELECT 1 FROM "Cart" WHERE id::text = "cartId"::text AND "userId"::text = auth.uid()::text)
);

CREATE POLICY "Users can view own profile" ON "Profile" FOR SELECT USING (auth.uid()::text = "userId"::text);
CREATE POLICY "Users can manage own profile" ON "Profile" FOR ALL USING (auth.uid()::text = "userId"::text);

CREATE POLICY "Users can view own child profiles" ON "ChildProfile" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "Profile" WHERE id = "profileId" AND "userId"::text = auth.uid()::text)
);
CREATE POLICY "Users can manage own child profiles" ON "ChildProfile" FOR ALL USING (
  EXISTS (SELECT 1 FROM "Profile" WHERE id = "profileId" AND "userId"::text = auth.uid()::text)
);

CREATE POLICY "Users can view own addresses" ON "Address" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "Profile" WHERE id = "profileId" AND "userId"::text = auth.uid()::text)
);
CREATE POLICY "Users can manage own addresses" ON "Address" FOR ALL USING (
  EXISTS (SELECT 1 FROM "Profile" WHERE id = "profileId" AND "userId"::text = auth.uid()::text)
);

CREATE POLICY "Admins can view security events" ON "SecurityEvent" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND role = 'ADMIN')
);
CREATE POLICY "System can create security events" ON "SecurityEvent" FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agegroup_updated_at BEFORE UPDATE ON "AgeGroup" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_texture_updated_at BEFORE UPDATE ON "Texture" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portionsize_updated_at BEFORE UPDATE ON "PortionSize" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_updated_at BEFORE UPDATE ON "Product" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_updated_at BEFORE UPDATE ON "Price" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_package_updated_at BEFORE UPDATE ON "Package" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packageitem_updated_at BEFORE UPDATE ON "PackageItem" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profile_updated_at BEFORE UPDATE ON "Profile" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_childprofile_updated_at BEFORE UPDATE ON "ChildProfile" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON "Cart" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_updated_at BEFORE UPDATE ON "Order" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orderitem_updated_at BEFORE UPDATE ON "OrderItem" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON "Inventory" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_address_updated_at BEFORE UPDATE ON "Address" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cartitem_updated_at BEFORE UPDATE ON "CartItem" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_storesettings_updated_at BEFORE UPDATE ON "StoreSettings" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Missing tables created successfully!' as status;
