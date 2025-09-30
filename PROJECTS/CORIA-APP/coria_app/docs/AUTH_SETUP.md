# CORIA App Authentication Setup Guide

This guide explains how to configure authentication for the CORIA app with Google Sign-In, Apple Sign-In, and Supabase.

## Prerequisites

- Supabase account and project
- Google Cloud Console access
- Apple Developer account (for iOS)
- Flutter development environment

## 1. Supabase Setup

### Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Note down your:
   - Project URL
   - Anon Key
   - Service Role Key

### Configure Authentication Providers

1. In Supabase Dashboard, go to **Authentication > Providers**
2. Enable **Email** provider
3. Enable **Google** provider:
   - Add your Google OAuth Client ID
   - Add your Google OAuth Client Secret
4. Enable **Apple** provider:
   - Add your Apple Service ID
   - Add your Apple Team ID
   - Upload your Apple Key

### Create Database Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  auth_provider TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  theme TEXT DEFAULT 'system',
  language TEXT DEFAULT 'tr',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  total_scans INTEGER DEFAULT 0,
  vegan_products INTEGER DEFAULT 0,
  non_vegan_products INTEGER DEFAULT 0,
  unknown_products INTEGER DEFAULT 0,
  saved_animals DECIMAL DEFAULT 0,
  saved_water DECIMAL DEFAULT 0,
  saved_co2 DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Similar policies for preferences and stats
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own stats" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile
  INSERT INTO public.user_profiles (id, email, display_name, photo_url, auth_provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
  );
  
  -- Insert default preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  -- Insert default stats
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 2. Google Sign-In Setup (Android)

### Configure Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing
3. Add Android app with package name: `com.yourcompany.coria`

### Generate SHA-1 Fingerprint

```bash
# Debug SHA-1
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release SHA-1 (use your release keystore)
keytool -list -v -keystore path/to/your/release.keystore -alias your-alias
```

### Configure OAuth 2.0

1. In Google Cloud Console, go to **APIs & Services > Credentials**
2. Create OAuth 2.0 Client ID for Android
3. Add SHA-1 fingerprints (both debug and release)
4. Download `google-services.json`
5. Place in `android/app/google-services.json`

### Update Android Configuration

Add to `android/app/build.gradle`:

```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

Add to `android/build.gradle`:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

## 3. Apple Sign-In Setup (iOS)

### Configure Apple Developer Account

1. Go to [Apple Developer](https://developer.apple.com)
2. Go to **Certificates, Identifiers & Profiles**
3. Create App ID with Sign In with Apple capability
4. Create Service ID for web authentication

### Update iOS Configuration

1. Open `ios/Runner.xcworkspace` in Xcode
2. Select Runner target
3. Go to **Signing & Capabilities**
4. Add **Sign In with Apple** capability

### Update Info.plist

Add to `ios/Runner/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>coria</string>
        </array>
    </dict>
</array>
```

## 4. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your values:
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret

# Apple (iOS only)
APPLE_SERVICE_ID=com.yourcompany.coria.service
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID
```

## 5. Testing Authentication

### Test Email Authentication
1. Run the app
2. Go to Sign Up screen
3. Enter email and password
4. Verify email in Supabase dashboard

### Test Google Sign-In
1. Ensure device has Google Play Services
2. Click "Google ile Devam Et"
3. Select Google account
4. Verify user created in Supabase

### Test Apple Sign-In (iOS only)
1. Run on physical iOS device
2. Click "Apple ile Devam Et"
3. Authenticate with Face ID/Touch ID
4. Verify user created in Supabase

## 6. Troubleshooting

### Google Sign-In Issues

**Error: PlatformException(sign_in_failed)**
- Check SHA-1 fingerprint matches
- Verify package name is correct
- Ensure google-services.json is in correct location

**Error: Invalid OAuth client**
- Regenerate OAuth credentials
- Check client ID in Supabase matches Google Console

### Apple Sign-In Issues

**Error: Invalid request**
- Verify Bundle ID matches Apple configuration
- Check Service ID is correct
- Ensure capabilities are enabled in Xcode

### Supabase Issues

**Error: Invalid API key**
- Check .env file is loaded
- Verify keys are correct
- Ensure Supabase project is active

## 7. Production Checklist

- [ ] Use production Supabase keys
- [ ] Configure production OAuth clients
- [ ] Add production SHA-1 for Google Sign-In
- [ ] Test on real devices
- [ ] Enable email verification
- [ ] Configure password policies
- [ ] Setup rate limiting
- [ ] Add security rules in Supabase
- [ ] Configure backup authentication methods
- [ ] Test account recovery flow

## Support

For issues or questions:
- Supabase Discord: https://discord.supabase.com
- Flutter Issues: https://github.com/flutter/flutter/issues
- CORIA Support: support@coria.app