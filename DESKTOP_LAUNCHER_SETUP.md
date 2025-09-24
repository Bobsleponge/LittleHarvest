# 🖥️ Desktop Launcher Setup Guide

## 🎯 **What I Created for You:**

I've created **4 different launcher options** that you can double-click to start your Tiny Tastes application:

### **1. 🪟 Tiny Tastes Launcher.bat** (Recommended)
- **Best for:** Most Windows users
- **How to use:** Just double-click the file
- **Features:** Full setup, error checking, colored output

### **2. ⚡ Tiny Tastes Launcher.ps1** (PowerShell)
- **Best for:** Users with PowerShell enabled
- **How to use:** Double-click or right-click → "Run with PowerShell"
- **Features:** Advanced error handling, colored output, better logging

### **3. 🔧 Tiny Tastes Launcher.vbs** (VBScript)
- **Best for:** Users with PowerShell restrictions
- **How to use:** Just double-click the file
- **Features:** Works even with strict security policies

### **4. 🌐 Tiny Tastes Launcher.html** (Browser)
- **Best for:** Quick status checking and links
- **How to use:** Double-click to open in browser
- **Features:** Status checking, quick links, visual interface

## 🚀 **How to Use:**

### **Step 1: Choose Your Launcher**
Pick one of the launcher files above (I recommend the `.bat` file for most users).

### **Step 2: Create Desktop Shortcut**
1. **Right-click** on your chosen launcher file
2. Select **"Create shortcut"**
3. **Drag the shortcut** to your desktop
4. **Rename it** to "Tiny Tastes" (optional)

### **Step 3: Double-Click to Start**
Just double-click your desktop shortcut and your Tiny Tastes application will start!

## 🎯 **What Each Launcher Does:**

### **Automatic Setup:**
- ✅ Checks if Node.js is installed
- ✅ Installs dependencies (if needed)
- ✅ Sets up database (if needed)
- ✅ Seeds sample data (if needed)
- ✅ Starts the development server

### **User-Friendly Features:**
- ✅ **Clear error messages** if something goes wrong
- ✅ **Progress indicators** so you know what's happening
- ✅ **Automatic browser opening** to your application
- ✅ **Test account information** displayed
- ✅ **Easy access links** to different parts of the app

## 🌐 **After Starting:**

Once the launcher runs successfully, you'll have access to:

- **🌐 Main Application:** http://localhost:3000
- **🔐 Quick Login:** http://localhost:3000/dev-login
- **👨‍💼 Admin Panel:** http://localhost:3000/admin
- **📊 Health Check:** http://localhost:3000/api/health

## 👤 **Test Accounts:**
- **Admin:** `admin@tinytastes.co.za`
- **Customer:** `customer@example.com`

## 🔧 **Troubleshooting:**

### **If the launcher doesn't work:**
1. **Try a different launcher** (try the `.vbs` file if others fail)
2. **Check if Node.js is installed** (download from https://nodejs.org/)
3. **Run as Administrator** (right-click → "Run as administrator")

### **If you get PowerShell errors:**
- Use the `.bat` or `.vbs` launcher instead
- Or run: `cmd /c "npm run setup && npm run dev"`

### **If port 3000 is busy:**
- The launcher will show an error message
- Close other applications using port 3000
- Or restart your computer

## 🎉 **You're All Set!**

Now you can start your Tiny Tastes application with just **one double-click** from your desktop! 

The launcher will handle everything automatically and open your application in the browser when it's ready.

**Happy coding!** 🚀
