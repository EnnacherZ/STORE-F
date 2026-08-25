# Storefront source conventions

## Dependency direction

```text
App/routes -> components -> contexts/server/config -> utilities and assets
```

- `App.tsx` owns route registration and provider composition only.
- The shared Axios instance in `server/connecter.tsx` is the sole backend client.
- Contexts own cross-route state; components should not mirror cart, products,
  authentication, or payment state in a second global store.
- Backend response assumptions should be represented by exported TypeScript types.
- User-visible copy must be present in `locales/en.ts`, `fr.ts`, and `ar.ts`.
- Product-type presentation belongs in `config/taxonomy.config.ts`; navigation
  components should consume that configuration rather than invent another map.

## Checkout flow

```text
Cart -> Checkout -> payment URL or COD creation
                    |
              PaymentCallback
                    |
       persisted order verification/finalization
                    |
             SuccessTransaction
```

Guest and registered checkout share the same commerce flow. Sign-in receives a
return location so it can resume checkout instead of redirecting to the home page.

## Adding a product type

1. Add it through Dash-F so the backend taxonomy remains authoritative.
2. Add its translation keys in all locale files.
3. Add optional presentation metadata in `config/taxonomy.config.ts`.
4. Do not attach component constructors to API data; resolve presentation locally.
5. Verify product listing/details at desktop and phone widths.
