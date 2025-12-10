# SeverKey Dashboard

A production-grade, visually stunning admin frontend for managing products and licenses, hosted on Cloudflare's edge network. This single-page dashboard provides an information-dense interface with stat cards, tables, activity panels, and quick actions, emphasizing a high-end dark theme with custom gradient accents, glassmorphism effects, and smooth micro-interactions.

[cloudflarebutton]

## Features

- **Dashboard Overview**: Greeting header, KPI stat cards (Products, Licenses, Active, Expired, Banned, Devices), recent licenses table, recent activity panel, and quick actions bar.
- **Products Management**: Grid of product cards with filters, search, and create-product sheets/modals.
- **License Management**: Table-driven interface with status chips, bulk actions (revoke, export), search, filters, and inline actions (view, copy key, block).
- **Create License Workflow**: Step-based modal/sheet for generating new licenses with product selection, expiry options, and metadata.
- **Settings & Account**: User profile, branding options, API keys, and team settings.
- **Responsive Design**: Mobile-first layout with collapsible sidebar, flawless across devices.
- **Visual Excellence**: Dark theme with gradients (#081028 primary, #0FB4D4 and #FF7A18 accents), glassmorphism cards, 60fps animations via Framer Motion, and accessibility features.
- **Data Integration**: Calls Cloudflare Worker endpoints for CRUD operations, with React Query for caching and optimistic updates.
- **Error Handling & UX**: Sonner toasts, loading skeletons, empty states with CTAs, and keyboard navigation.

## Technology Stack

### Frontend
- **React 18**: Core framework with React Router for navigation.
- **shadcn/ui**: Accessible, customizable UI components built on Radix UI and Tailwind CSS.
- **Tailwind CSS v3**: Utility-first styling with custom themes, animations, and responsive design.
- **@tanstack/react-query**: Data fetching, caching, and mutations.
- **Framer Motion**: Micro-interactions and entrance animations.
- **Lucide React**: Icon library.
- **Recharts**: For analytics sparklines and charts (future phases).
- **Sonner**: Toast notifications.
- **Zustand**: Lightweight state management (with primitive selectors for performance).
- **Zod**: Form validation.

### Backend
- **Cloudflare Workers**: Serverless edge runtime for API endpoints.
- **Hono**: Fast web framework for routing and middleware.
- **Durable Objects**: Stateful storage via GlobalDurableObject for entities (products, licenses).
- **TypeScript**: End-to-end type safety with shared types.

### Tools & Utilities
- **Vite**: Build tool and dev server.
- **Bun**: Package manager and runtime (recommended for development).
- **Cloudflare CLI (Wrangler)**: Deployment and type generation.

## Quick Start

### Prerequisites
- Node.js 18+ (or Bun 1.0+).
- Cloudflare account (free tier sufficient for development).
- Wrangler CLI installed: `bun install -g wrangler`.

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd severkey-dashboard
   ```

2. Install dependencies using Bun:
   ```
   bun install
   ```

3. Generate Cloudflare Worker types:
   ```
   bun run cf-typegen
   ```

4. Set up environment (optional for local dev; required for production):
   ```
   wrangler secret put GLOBAL_DURABLE_OBJECT_ID  # If needed for custom DO setup
   ```

## Development

### Running the Development Server
Start the local development server:
```
bun run dev
```
The app will be available at `http://localhost:3000`. The Worker API runs in parallel for edge simulation.

### Key Development Commands
- **Build for Production**: `bun run build` (outputs to `dist/`).
- **Preview Build**: `bun run preview` (serves the built app locally).
- **Lint Code**: `bun run lint` (ESLint with TypeScript support).
- **Type Check**: `bun tsc --noEmit`.

### Usage Examples

#### Dashboard Navigation
The root route (`/`) renders the main dashboard. Navigation uses React Router:
- Sidebar links to Products, Licenses, and Settings.
- Quick actions trigger sheets for creating products/licenses.

#### API Integration Example
Fetch licenses using React Query:
```tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { License } from '@shared/types';

function LicensesTable() {
  const { data: licenses, isLoading } = useQuery({
    queryKey: ['licenses'],
    queryFn: () => api<{ items: License[]; next: string | null }>('/api/licenses'),
  });

  if (isLoading) return <Skeleton className="w-full h-8" />; // shadcn Skeleton

  return (
    <Table>
      <TableBody>
        {licenses?.items.map(license => (
          <TableRow key={license.id}>
            <TableCell>{license.key}</TableCell>
            <TableCell><Badge variant={license.status === 'active' ? 'default' : 'secondary'}>{license.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

#### Creating a License (Mutation Example)
```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

function CreateLicenseButton() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: { productId: string; expiry: Date }) => api('/api/licenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      toast.success('License created successfully');
    },
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Create License</Button>
      </SheetTrigger>
      <SheetContent>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          mutation.mutate({ productId: formData.get('productId') as string, expiry: new Date(formData.get('expiry') as string) });
        }}>
          {/* Form fields using shadcn Form, Input, Select */}
          <Button type="submit" disabled={mutation.isPending}>Generate</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
```

### Project Structure
- `src/pages/`: Main views (HomePage.tsx as dashboard entry).
- `src/components/ui/`: shadcn/ui primitives (do not modify).
- `src/components/`: Custom components (e.g., StatCard, LicenseTable).
- `worker/user-routes.ts`: API endpoints (extend for products/licenses).
- `shared/types.ts`: Shared TypeScript interfaces (User → Product, Chat → License).
- `src/lib/api-client.ts`: Fetch wrapper for API calls.

**Note**: Do not modify `worker/core-utils.ts`, `wrangler.jsonc`, or `worker/index.ts` to avoid breaking Durable Object patterns.

## Deployment

Deploy to Cloudflare Workers for edge hosting:

1. Authenticate with Wrangler:
   ```
   wrangler login
   ```

2. Publish the Worker and static assets:
   ```
   bun run deploy
   ```
   This builds the frontend and deploys the Worker bundle.

3. Access your deployed app at the provided URL (e.g., `https://severkey-dashboard.your-account.workers.dev`).

For one-click deployment from this repository:

[cloudflarebutton]

### Custom Domain
Bind a custom domain via the Cloudflare dashboard:
- Go to Workers > Your Worker > Triggers > Custom Domains.
- Add and configure your domain (CNAME to the Worker URL).

### Environment Variables
Set secrets for production:
```
wrangler secret put API_SECRET  # Example for auth
```

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

Follow TypeScript and ESLint rules. Test changes locally before submitting.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.