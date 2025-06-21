# 🚀 Development Database Setup Guide

## 📋 Overview
This guide will help you set up a separate development database while keeping your existing production database on Vercel untouched.

---

## 🎯 Step 1: Create MongoDB Atlas Development Database

### 1.1 Access MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign in to your account
3. Navigate to your existing cluster

### 1.2 Create Development Database
1. In your cluster, click on **"Browse Collections"**
2. Click **"Create Database"**
3. Enter:
   - **Database Name**: `cuss-purwakarta-dev`
   - **Collection Name**: `users` (we'll create other collections via Prisma)
4. Click **"Create Database"**

### 1.3 Get Development Connection String
1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `<dbname>` with `cuss-purwakarta-dev`

**Example connection string:**
```
mongodb+srv://username:password@cluster.mongodb.net/cuss-purwakarta-dev?retryWrites=true&w=majority
```

---

## 🎯 Step 2: Create Environment Configuration

### 2.1 Create `.env.local` File
Create a new file `.env.local` in your project root with the following content:

```env
# Development Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/cuss-purwakarta-dev?retryWrites=true&w=majority"

# NextAuth Configuration (Development)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-development-secret-key-here"

# Google Maps API (if needed)
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Environment
NODE_ENV="development"
```

**⚠️ Important:** Replace the placeholder values with your actual credentials!

---

## 🎯 Step 3: Set Up Development Database

### 3.1 Test Database Connection
```bash
npm run db:setup:dev
```

This will test your database connection and provide helpful error messages if something is wrong.

### 3.2 Push Schema to Development Database
```bash
npm run db:push:dev
```

This will create all the necessary collections in your development database.

### 3.3 Seed the Development Database
```bash
npm run db:seed:dev
```

This will populate your development database with initial data.

### 3.4 Start Development Server
```bash
npm run dev
```

Your application should now be running with the development database!

---

## 🎯 Step 4: Database Management Commands

### 4.1 Daily Development Commands
```bash
# Start development server
npm run dev

# View database in Prisma Studio
npm run db:studio:dev

# Reset database if needed
npm run db:reset:dev

# Generate Prisma client after schema changes
npm run db:generate
```

### 4.2 Database Operations
```bash
# Test database connection
npm run db:setup:dev

# Push schema changes
npm run db:push:dev

# Reset and reseed database
npm run db:reset:dev

# Migrate data from production (optional)
npm run db:migrate:dev
```

---

## 🎯 Step 5: Migration from Production (Optional)

If you want to copy data from your production database to development:

### 5.1 Add Production Database URL
Add this to your `.env.local` file:
```env
DATABASE_URL_PROD="mongodb+srv://username:password@cluster.mongodb.net/cuss-purwakarta?retryWrites=true&w=majority"
```

### 5.2 Run Migration
```bash
npm run db:migrate:dev
```

This will copy all data from production to development database.

---

## 🎯 Step 6: Troubleshooting

### 6.1 Common Issues

**Issue**: "Cannot connect to database"
**Solution**: 
- Check your `.env.local` file
- Verify MongoDB Atlas network access includes your IP
- Ensure connection string is correct

**Issue**: "Prisma client not generated"
**Solution**:
```bash
npm run db:generate
```

**Issue**: "Database schema out of sync"
**Solution**:
```bash
npm run db:push:dev
```

### 6.2 Useful Commands
```bash
# Check database connection
npx prisma db pull

# View database logs
npx prisma studio

# Reset everything
npm run db:reset:dev
```

---

## 🎯 Step 7: Production Safety

### 7.1 Vercel Environment Variables
Your Vercel project should have these environment variables:
- `DATABASE_URL`: Your production MongoDB connection string
- `NEXTAUTH_URL`: Your production domain
- `NEXTAUTH_SECRET`: Your production secret

### 7.2 Deployment Checklist
Before deploying to production:
- [ ] Test all features locally with development database
- [ ] Ensure `.env.local` is not committed to git
- [ ] Verify Vercel environment variables are correct
- [ ] Run `npm run build` locally to ensure no errors

---

## ✅ Summary

You now have:
- ✅ Separate development database (`cuss-purwakarta-dev`)
- ✅ Production database remains untouched
- ✅ Local development environment
- ✅ Database management scripts
- ✅ Safe deployment workflow

Your development workflow:
1. Work locally with development database
2. Test everything thoroughly
3. Deploy to production (uses production database)
4. Production database stays safe and unchanged

This setup ensures you can develop freely without any risk to your production data! 🎉

---

## 📞 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify your MongoDB Atlas settings
3. Ensure your `.env.local` file is correctly configured
4. Run the setup commands in order 