# Encanto Floristería - Store Frontend

E-commerce store for **Encanto Floristería** - Browse and purchase beautiful floral arrangements for all occasions.

## 🌹 About Encanto

Encanto is a flower shop specialized in floral arrangements for all occasions located in **Manta, Ecuador**. This is the customer-facing online store where users can:

- 🎂 Browse floral arrangements for birthdays
- 💑 Order anniversary bouquets
- ❤️ Send love & romance flowers
- 🙏 Express gratitude with beautiful flowers
- 🎉 Celebrate special occasions

## 🚀 Tech Stack

- **Framework:** Next.js 16.0.3 with App Router
- **Language:** TypeScript 5.9.3
- **UI Library:** React 19.2.0
- **Styling:** Tailwind CSS 4.1.17
- **Package Manager:** pnpm (REQUIRED)

## ✨ Planned Features

### Shopping Experience
- Product catalog with search and filters
- Product detail pages with image gallery
- Shopping cart with real-time updates
- Guest checkout and user authentication
- Saved delivery addresses

### Delivery System
- Scheduled deliveries (minimum 1 day advance)
- Zone-based delivery fees
- Time slot selection
- Special occasion messages
- Surprise delivery option

### Payment Methods
- **Bank Transfer** - Base price (upload payment proof)
- **Online Payment** - PayPal/Kushki (base price + 4%)

### Design
- Pastel pink color palette (Encanto branding)
- Typography: DM Serif Display (headings) + Poppins (body)
- Responsive design for mobile and desktop
- Smooth animations and transitions

## 📋 Prerequisites

- Node.js 20+
- pnpm 9+
- Backend running at `http://localhost:3001`

## 🔧 Installation

1. **Install dependencies**
```bash
pnpm install
```

2. **Configure environment variables**

Create `.env.local` file:

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Payment Gateways
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
NEXT_PUBLIC_KUSHKI_PUBLIC_KEY=your-kushki-public-key

# WhatsApp (for same-day orders)
NEXT_PUBLIC_WHATSAPP_NUMBER=+593987654321
NEXT_PUBLIC_WHATSAPP_MESSAGE=Hola! Necesito un pedido urgente
```

3. **Start development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🛠️ Available Scripts

```bash
pnpm dev       # Development server
pnpm build     # Production build
pnpm start     # Production server
pnpm lint      # Run linter
```

## 📁 Planned Structure

```
src/
├── app/                      # App Router
│   ├── (shop)/              # Shop layout group
│   │   ├── products/        # Product catalog
│   │   ├── product/[slug]/  # Product detail
│   │   └── cart/            # Shopping cart
│   ├── checkout/            # Checkout flow
│   ├── auth/                # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   └── account/             # User account pages
│       ├── orders/          # Order history
│       └── addresses/       # Saved addresses
├── features/                # Features by module
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   └── authentication/
├── components/              # Shared components
│   ├── ui/                  # UI components
│   └── layout/              # Layout components
├── store/                   # Zustand stores
│   ├── cart-store.ts
│   └── auth-store.ts
└── lib/                     # Utilities
    └── utils.ts
```

## 🎨 Color Palette

```css
/* Main colors */
--brand-primary: #aa9083;     /* Main brown */
--brand-secondary: #f2d0c5;   /* Light pastel pink */
--brand-accent: #f9e4e4;      /* Very light pastel pink */
--brand-gold: #c9a961;        /* Premium gold */
```

## 🛒 Shopping Flow

### Standard Order (1+ day advance)
1. Browse products
2. Add to cart
3. Proceed to checkout
4. Fill delivery details (recipient info, address, zone)
5. Select delivery date (min 1 day) and time slot
6. Add card message
7. Choose payment method:
   - **Bank Transfer:** Base price → Upload proof
   - **Online Payment:** Base price + 4% → PayPal/Kushki
8. Order confirmation email

### Same-Day Orders
- Not available through website
- Redirect to WhatsApp for urgent orders
- Direct contact with florist

## 🚚 Delivery System

### Zone Selection
- User selects delivery zone from dropdown
- Delivery fee calculated automatically
- Estimated delivery time displayed

### Time Slots
Specific time windows (configurable):
- 08:00 - 10:00
- 10:00 - 12:00
- 12:00 - 14:00
- 14:00 - 16:00
- 16:00 - 18:00
- 18:00 - 20:00

### Special Dates
For high-demand dates (Valentine's, Mother's Day):
- Warning message shown
- Advance order requirement (configurable)
- Limited order capacity

## 💳 Payment Methods

### Bank Transfer (Recommended)
- **Price:** Base price (no fees)
- Special message: "Precio especial por transferencia"
- Upload payment proof (image/PDF)
- Admin verification required

### Online Payment (PayPal/Kushki)
- **Price:** Base price + 4%
- Instant confirmation
- International cards accepted

## 📦 Status

### Current (November 2025)
- ✅ Basic Next.js setup
- ✅ Tailwind CSS 4 configured
- ⏳ No features implemented yet (focus on backend and backoffice first)

### Roadmap
- [ ] Product catalog
- [ ] Product detail page
- [ ] Shopping cart
- [ ] User authentication
- [ ] Checkout flow
- [ ] Payment integration
- [ ] Order tracking
- [ ] User account pages

## 🔗 Related Projects

- **Backend:** [encanto-backend](../encanto-backend) - NestJS API
- **Backoffice:** [encanto-backoffice](../encanto-backoffice) - Admin panel

## 📝 Development Notes

### Server Actions Pattern
All backend communication will use Server Actions for better security:

```typescript
'use server';

export async function getProducts() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
  return response.json();
}
```

### Cart State Management
Using Zustand for client-side cart state:

```typescript
interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}
```

### Guest Checkout
Users can checkout without creating an account:
- Provide email, name, phone at checkout
- Option to create account after purchase
- Access order status via email link

## 📄 License

Private - All rights reserved

---

> Developed with ❤️ for Encanto Floristería
