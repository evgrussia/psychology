import { redirect } from 'next/navigation';

// Index route for navigator.
// We currently treat `state-navigator` as the default published navigator slug.
export default function StartNavigatorIndexPage() {
  redirect('/start/navigator/state-navigator');
}

