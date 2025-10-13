# Supabase Setup Guide

## 🌐 **Step 1: Create Supabase Account**

1. **Go to**: [supabase.com](https://supabase.com)
2. **Click**: "Start your project"
3. **Sign up** with GitHub (recommended)
4. **Verify** your email

## 🏗️ **Step 2: Create New Project**

1. **Click**: "New Project"
2. **Choose**: Your organization
3. **Project details**:
   - **Name**: `little-harvest` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., `us-east-1` for US)
4. **Click**: "Create new project"
5. **Wait**: 2-3 minutes for setup

## 🔑 **Step 3: Get Connection Details**

1. **Go to**: Project Dashboard
2. **Click**: Settings (gear icon) → Database
3. **Copy** the connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## 📋 **Step 4: Update Your Environment**

Replace in your `.env.local`:
```bash
# OLD (local database)
DATABASE_URL="postgresql://littleharvest:your-secure-database-password@localhost:5432/littleharvest?schema=public"

# NEW (Supabase cloud database)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

## 🎯 **Step 5: Test Connection**

Run this command to test:
```bash
npm run db:push
```

## ✅ **Benefits You'll Get:**

- **🌐 Cloud database** - Accessible from anywhere
- **📈 Auto-scaling** - Handles traffic spikes
- **🔒 Security** - Built-in security features
- **📊 Dashboard** - Visual database management
- **🚀 Performance** - Optimized for web apps
- **💰 Free tier** - 500MB database, 2GB bandwidth

## 🆘 **Need Help?**

- **Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Community**: [github.com/supabase/supabase](https://github.com/supabase/supabase)
- **Support**: Available in dashboard

---

**Next**: Once Supabase is set up, we'll remove Redis and optimize your app! 🎉
