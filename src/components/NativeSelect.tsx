import { render, type JSX } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

// WebKit can report a CSP style-src-attr violation while constructing a select's
// native shadow tree in an active document, before any application props exist.
// Construct the unchanged native control in inert template content, then adopt it.
// No markup, styles, user input or policy settings enter this construction path.
export function NativeSelect(props: JSX.SelectHTMLAttributes<HTMLSelectElement>) {
  const host = useRef<HTMLSpanElement>(null);
  const mounted = useRef(false);
  useLayoutEffect(() => {
    const container = host.current!;
    if (!mounted.current) {
      const template = document.createElement('template');
      const select = template.content.ownerDocument.createElement('select');
      container.append(select);
      mounted.current = true;
    }
    render(<select {...props} />, container);
  });
  useLayoutEffect(() => {
    const container = host.current!;
    return () => {
      render(null, container);
      mounted.current = false;
    };
  }, []);
  return <span class="native-select" ref={host} />;
}
