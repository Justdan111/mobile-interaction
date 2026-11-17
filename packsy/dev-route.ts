/**
 * Dev-only navigation for screenshot checks. Expo Go 58 ignores the path in
 * `exp://host:port/--/<route>` deep links, and synthetic taps don't reach the
 * simulator on this machine, so set a route here and fast refresh takes the
 * app there. Commit it as null.
 */
export const DEV_ROUTE: string | null = null;
