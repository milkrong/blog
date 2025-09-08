# Registration Security Configuration

## 🔒 Registration Security Options

Your blog system now has flexible registration security options to control who can create accounts.

### 🛡️ **Security Features Implemented**

1. **Secret Key Registration**: Users must know a secret key to register
2. **Registration Toggle**: Option to completely disable registration
3. **UI Hiding**: Registration UI is hidden when disabled
4. **Server-Side Validation**: All security checks happen on the server

### ⚙️ **Configuration Options**

#### **Option 1: Secret Key Registration (Recommended)**
- Users need to know a secret key to register
- Registration UI shows secret key field
- More secure than open registration
- Easy to share the secret with trusted users

#### **Option 2: Completely Disable Registration**
- No one can register new accounts
- Registration UI is completely hidden
- Most secure for personal blogs
- Only existing users can login

### 🔧 **Environment Variables**

Add these to your `.env.local` file:

```bash
# JWT Secret (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Registration Secret (REQUIRED for secret key mode)
REGISTRATION_SECRET=your-registration-secret-key-2024

# Registration Control (OPTIONAL)
# Set to 'false' to completely disable registration
# Set to 'true' or omit to enable secret key registration
REGISTRATION_ENABLED=true
```

### 🐳 **Docker Configuration**

For Docker, add to your `.env` file:

```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
REGISTRATION_SECRET=your-registration-secret-key-2024
REGISTRATION_ENABLED=true
```

### 📋 **Setup Instructions**

#### **For Secret Key Registration (Default)**:

1. **Set environment variables**:
   ```bash
   REGISTRATION_SECRET=my-super-secret-key-2024
   REGISTRATION_ENABLED=true
   ```

2. **Share the secret** with people who need admin access
3. **Users register** with email, password, and the secret key
4. **Registration UI** shows the secret key field

#### **To Completely Disable Registration**:

1. **Set environment variable**:
   ```bash
   REGISTRATION_ENABLED=false
   ```

2. **Registration UI disappears** from login page
3. **Only existing users** can login
4. **No new accounts** can be created

### 🔍 **How It Works**

#### **Secret Key Mode**:
1. User clicks "注册" (Register) on login page
2. Form shows email, password, and secret key fields
3. User enters the secret key you provided
4. Server validates the secret key
5. If valid, account is created
6. If invalid, error message is shown

#### **Disabled Mode**:
1. Registration button is hidden
2. Only login form is visible
3. Server rejects all registration attempts
4. Error: "Registration is currently disabled"

### 🛠️ **Security Benefits**

- **Prevents Random Users**: Only people with the secret can register
- **Easy to Control**: Change the secret to revoke registration access
- **No Public Registration**: Stops automated account creation
- **Personal Blog Security**: Perfect for personal blog systems

### 🔄 **Changing Settings**

#### **To Change the Secret Key**:
1. Update `REGISTRATION_SECRET` in your environment
2. Restart your application
3. Share new secret with authorized users

#### **To Disable Registration After Setup**:
1. Set `REGISTRATION_ENABLED=false`
2. Restart your application
3. Registration UI disappears

#### **To Re-enable Registration**:
1. Set `REGISTRATION_ENABLED=true`
2. Restart your application
3. Registration UI reappears

### 🚨 **Security Recommendations**

1. **Use Strong Secrets**: Make your registration secret long and random
2. **Change Regularly**: Update the secret periodically
3. **Share Securely**: Don't put secrets in code or public repos
4. **Monitor Access**: Keep track of who has the secret
5. **Disable When Not Needed**: Turn off registration after initial setup

### 📝 **Example Secrets**

**Good secrets** (long and random):
```bash
REGISTRATION_SECRET=admin-blog-2024-xyz789-abc123-def456
REGISTRATION_SECRET=my-personal-blog-secret-key-very-long-and-secure
```

**Bad secrets** (too short or predictable):
```bash
REGISTRATION_SECRET=123456
REGISTRATION_SECRET=admin
REGISTRATION_SECRET=secret
```

### 🔧 **Troubleshooting**

**"Invalid registration secret" error**:
- Check that `REGISTRATION_SECRET` is set correctly
- Verify the secret matches what you're entering
- Restart the application after changing the secret

**"Registration is currently disabled" error**:
- Set `REGISTRATION_ENABLED=true` to enable registration
- Restart the application

**Registration UI not showing**:
- Check that `REGISTRATION_ENABLED=true`
- Clear browser cache and refresh

### 📚 **Files Modified**

- `src/lib/security.ts` - Registration security configuration
- `src/server/router.ts` - Registration endpoint with secret validation
- `src/pages/login.tsx` - Updated UI with secret field
- `docker-compose.yml` - Added environment variables

Your registration system is now secure and flexible! 🎉