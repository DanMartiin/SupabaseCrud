# 🚀 DM Soles - Premium Footwear Store

A full-featured online footwear store built with **Next.js 14**, **TypeScript**, **Supabase**, and **Stripe** payments. This project demonstrates complete CRUD operations with authentication, admin panel, user dashboard, search functionality, and payment integration.

## ✨ Features

### 🔐 Authentication System
- **User Registration & Login** with Supabase Auth
- **Role-based Access Control** (Admin/User)
- **Protected Routes** and middleware
- **Session Management**

### 👨‍💼 Admin Panel
- **Complete Product Management** (Create, Read, Update, Delete)
- **Dashboard Analytics** with sales statistics
- **User Management** overview
- **Real-time Data** with Supabase
- **Image Upload** with Supabase Storage

### 👤 Regular User Dashboard
- **Personal Profile** management
- **Purchase History** tracking
- **Account Settings**
- **Order Management**

### 🔍 Advanced Search & Filters
- **Real-time Search** across products
- **Category & Brand Filters**
- **Price Range Filtering**
- **Sorting Options** (Price, Name, Date)
- **URL-based Filtering** (shareable links)

### 💳 Payment Integration
- **Stripe Payment Processing** (Sandbox mode)
- **Secure Payment Forms**
- **Payment History** tracking
- **Order Confirmation**

### 📱 Responsive Design
- **Mobile-first** approach
- **Grid & List View** modes
- **Touch-friendly** interface
- **Cross-browser** compatibility

### 🎨 Modern UI/UX
- **Tailwind CSS** styling
- **Lucide Icons**
- **Loading States**
- **Error Handling**
- **Success Notifications**

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── products/          # Product pages (CRUD)
│   ├── profile/           # User profile
│   ├── payments/          # Payment pages
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── auth/             # Auth components
│   ├── admin/            # Admin components
│   └── ui/               # UI components
├── lib/                  # Utility libraries
├── types/                # TypeScript types
└── hooks/                # Custom hooks
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for payments)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd crud-operations
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration (Optional for sandbox)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 4. Database Setup
Run the database setup script in your Supabase SQL editor:

```sql
-- Create tables
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  size TEXT[],
  color TEXT[],
  images TEXT[],
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  payment_method TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Users can manage own products" ON products FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create payments" ON payments FOR INSERT WITH CHECK (user_id = auth.uid());
```

### 5. Storage Setup
Create a storage bucket for product images:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND auth.role() = 'authenticated'
);
```

### 6. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📋 CRUD Operations

### 🔧 Create (C)
- **Product Creation**: `/products/create`
- **User Registration**: `/auth/signup`
- **Payment Processing**: Integrated Stripe checkout

### 📖 Read (R)
- **Product Listing**: `/products` with search & filters
- **Product Details**: `/products/[id]`
- **User Profile**: `/profile`
- **Admin Dashboard**: `/admin`

### 🔄 Update (U)
- **Product Editing**: `/products/[id]/edit`
- **Profile Updates**: `/profile`
- **User Management**: Admin panel

### 🗑️ Delete (D)
- **Product Deletion**: Admin panel & product cards
- **Account Deletion**: Profile settings

## 🔐 Authentication Flow

1. **Registration**: Users sign up with email/password
2. **Login**: Secure authentication with Supabase
3. **Role Assignment**: Default 'user' role, admin manually assigned
4. **Protected Routes**: Middleware ensures proper access
5. **Session Management**: Automatic token refresh

## 💳 Payment Integration

### Stripe Setup
1. Create Stripe account
2. Get API keys from dashboard
3. Add keys to environment variables
4. Test with sandbox mode

### Payment Flow
1. User selects product
2. Payment modal opens
3. Stripe Elements integration
4. Payment processing
5. Order confirmation
6. Database update

## 🎨 UI Components

### Reusable Components
- `ProductCard`: Product display with actions
- `SearchFilters`: Advanced filtering interface
- `Pagination`: Page navigation
- `PaymentModal`: Stripe payment form
- `Navigation`: Responsive navigation bar

### Styling
- **Tailwind CSS** for utility-first styling
- **Responsive design** for all screen sizes
- **Dark mode** ready (can be extended)
- **Accessibility** compliant

## 🔍 Search & Filtering

### Search Features
- **Real-time search** across product titles, descriptions, brands
- **URL-based filtering** for shareable links
- **Debounced input** for performance

### Filter Options
- **Category**: Running, Basketball, Casual, etc.
- **Brand**: Nike, Adidas, Puma, etc.
- **Price Range**: Min/max price filtering
- **Sorting**: Price, name, date (ascending/descending)

## 📊 Admin Features

### Dashboard Analytics
- **Total Users**: Registered user count
- **Total Products**: Active product count
- **Total Sales**: Revenue tracking
- **Recent Activity**: Latest transactions

### Product Management
- **Bulk Operations**: Multiple product management
- **Image Upload**: Drag & drop interface
- **Stock Management**: Inventory tracking
- **Status Control**: Active/inactive products

## 🚀 Deployment

### Vercel Deployment
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration/login
- [ ] Product CRUD operations
- [ ] Search and filtering
- [ ] Payment processing
- [ ] Admin panel access
- [ ] Responsive design
- [ ] Error handling

## 🐛 Error Handling

### Comprehensive Error Management
- **Database Errors**: Graceful fallbacks
- **Network Errors**: Retry mechanisms
- **Validation Errors**: User-friendly messages
- **Payment Errors**: Clear feedback

## 📈 Performance Optimization

### Best Practices
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Supabase query caching
- **Lazy Loading**: Component lazy loading

## 🔒 Security Features

### Security Measures
- **Row Level Security**: Database-level protection
- **Input Validation**: Client and server-side validation
- **Authentication**: Secure token-based auth
- **CORS Protection**: Proper CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

**Built with ❤️ using Next.js, TypeScript, Supabase, and Stripe**








