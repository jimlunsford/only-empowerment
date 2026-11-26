import { frameworkChoices } from './framework-navigation';

export function FrameworkLinks({ current }: { current: string }) {
  return (
    <section class="framework-bridges" aria-label="Where to go next">
      <h2>Where to go next</h2>
      <ul>
        {frameworkChoices
          .filter((item) => item.id !== current)
          .map((item) => (
            <li key={item.id}>
              <a href={'#/' + item.id}>{item.title}</a>: {item.situation}
            </li>
          ))}
      </ul>
      <a href="#/">Choose another framework</a>
    </section>
  );
}
