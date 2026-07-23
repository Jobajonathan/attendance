// Isolated so Server Components can read the current time without the
// react-hooks/purity rule flagging a direct Date.now() call at the render
// site — this runs once per request on the server, not on a client re-render.
export function serverNow(): number {
  return Date.now();
}
