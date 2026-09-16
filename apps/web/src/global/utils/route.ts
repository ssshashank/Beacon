/**
 * @function normalizePath
 * @arg path - Raw URL pathname (may include trailing slashes).
 * @purpose Strips trailing slashes so route comparisons are consistent.
 * @return Normalized path, or "/" when the path is empty after trimming.
 */
function normalizePath(path: string): string {
  const trimmed = path.replace(/\/+$/, '');
  return trimmed || '/';
}

/**
 * @function isSidebarRouteActive
 * @arg pathname - Current browser pathname (e.g. /containers/containerID).
 * @arg route - Sidebar link path to test (e.g. /containers/containerID or /containers).
 * @purpose Returns whether the sidebar item should stay highlighted on nested routes,
 *   without sibling routes stealing active state.
 * @return true when the sidebar link should appear active.
 */
function isSidebarRouteActive(pathname: string, route: string): boolean {
  const current = normalizePath(pathname);
  const target = normalizePath(route);

  if (target === '/images') {
    return current === '/images';
  }

  if (target === '/containers') {
    return current === '/containers' || current.startsWith("/containers/");
  }

  // if (target === '/bench') {
  //   return current === '/bench' || current.startsWith('//spaces/');
  // }

  return current === target || current.startsWith(`${target}/`);
}

export { isSidebarRouteActive, normalizePath };
