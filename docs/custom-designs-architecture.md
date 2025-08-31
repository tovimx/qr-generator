# Custom Designs Architecture

## Overview
Implementation plan for custom link showcase designs allowing users to personalize their QR code landing pages with themes, colors, layouts, and branding.

## Database Schema Changes

```sql
-- Add design customization fields to QRCode model
ALTER TABLE qr_codes ADD COLUMN theme_id VARCHAR(50) DEFAULT 'default';
ALTER TABLE qr_codes ADD COLUMN primary_color VARCHAR(7) DEFAULT '#6366f1';
ALTER TABLE qr_codes ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#8b5cf6';  
ALTER TABLE qr_codes ADD COLUMN background_type VARCHAR(20) DEFAULT 'gradient';
ALTER TABLE qr_codes ADD COLUMN background_value TEXT;
ALTER TABLE qr_codes ADD COLUMN button_style VARCHAR(20) DEFAULT 'rounded';
ALTER TABLE qr_codes ADD COLUMN font_family VARCHAR(50) DEFAULT 'inter';
ALTER TABLE qr_codes ADD COLUMN custom_css TEXT;
ALTER TABLE qr_codes ADD COLUMN avatar_url VARCHAR(500);
ALTER TABLE qr_codes ADD COLUMN description TEXT;
ALTER TABLE qr_codes ADD COLUMN social_links JSONB;
```

## Design System Components

### 1. **Theme Templates**
Predefined design templates users can choose from:

- **Modern Minimal**: Clean white/gray with subtle shadows
- **Gradient Pop**: Vibrant gradients with modern buttons  
- **Corporate**: Professional blue/gray corporate styling
- **Dark Mode**: Dark background with neon accents
- **Nature**: Green/earth tones with organic shapes
- **Creative**: Bold colors with creative layouts
- **Social**: Instagram/TikTok inspired designs
- **Custom**: User-defined colors and styling

### 2. **Customization Options**

#### Colors
- Primary color (buttons, accents)
- Secondary color (backgrounds, borders)
- Text color
- Background color/gradient

#### Layout & Styling  
- Button styles: rounded, square, pill, glassmorphism
- Card styles: elevated, flat, bordered, glassmorphism
- Spacing: compact, normal, spacious
- Alignment: center, left, full-width

#### Typography
- Font families: Inter, Poppins, Roboto, Playfair, etc.
- Font sizes: small, normal, large
- Font weights: normal, medium, bold

#### Branding
- Profile avatar/logo
- Description/bio text
- Custom CSS for advanced users
- Social media links

### 3. **Background Options**
- Solid colors
- Linear gradients (customizable)
- Radial gradients
- Image uploads
- Patterns (geometric, organic)
- Video backgrounds (premium)

## Implementation Plan

### Phase 1: Core Infrastructure
1. **Database Migration**: Add design fields to QRCode model
2. **Theme System**: Create theme definition system
3. **API Endpoints**: CRUD operations for design customization
4. **Preview System**: Real-time preview functionality

### Phase 2: UI Implementation  
1. **Design Editor**: Theme selection and customization interface
2. **Live Preview**: Real-time preview as user makes changes
3. **Template Gallery**: Browse and select from predefined themes
4. **Color Picker**: Advanced color selection tools

### Phase 3: Advanced Features
1. **Custom CSS**: Allow advanced users to add custom CSS
2. **Asset Management**: Image/logo upload and management
3. **Social Integration**: Social media links and icons
4. **Analytics Integration**: Track engagement by design

### Phase 4: Premium Features
1. **Video Backgrounds**: Animated video backgrounds
2. **Advanced Animations**: CSS animations and transitions
3. **Custom Domains**: Branded URLs with custom designs
4. **A/B Testing**: Test different designs for conversion

## File Structure

```
src/
├── components/
│   ├── design/
│   │   ├── ThemeSelector.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── LayoutCustomizer.tsx
│   │   ├── PreviewFrame.tsx
│   │   └── DesignEditor.tsx
├── lib/
│   ├── themes/
│   │   ├── templates.ts
│   │   ├── colors.ts
│   │   └── fonts.ts
├── hooks/
│   ├── use-design.ts
│   └── use-theme-preview.ts
├── app/
│   ├── api/
│   │   └── qr-codes/
│   │       └── [id]/
│   │           └── design/
│   │               └── route.ts
│   └── (public)/
│       └── q/
│           └── [shortCode]/
│               ├── page.tsx (updated)
│               └── components/
│                   ├── ThemeRenderer.tsx
│                   └── LinkButton.tsx
```

## API Endpoints

```typescript
// GET /api/qr-codes/[id]/design - Get current design
// PUT /api/qr-codes/[id]/design - Update design settings
// GET /api/themes - List available themes  
// POST /api/qr-codes/[id]/design/preview - Generate preview
```

## Theme Definition Schema

```typescript
interface Theme {
  id: string
  name: string
  description: string
  preview: string
  category: 'modern' | 'creative' | 'professional' | 'social'
  styles: {
    background: BackgroundStyle
    card: CardStyle
    buttons: ButtonStyle
    typography: TypographyStyle
    colors: ColorPalette
  }
}

interface DesignSettings {
  themeId: string
  primaryColor: string
  secondaryColor: string
  backgroundType: 'solid' | 'gradient' | 'image' | 'pattern'
  backgroundValue: string
  buttonStyle: 'rounded' | 'square' | 'pill' | 'glass'
  fontFamily: string
  customCSS?: string
  avatarUrl?: string
  description?: string
  socialLinks?: SocialLink[]
}
```

## Success Metrics
- User engagement with design customization (% who customize)
- Link click-through rates by theme
- User retention after using custom designs
- Premium feature adoption rates