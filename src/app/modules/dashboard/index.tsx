import { ProfileDropdown } from '../../components/perfilDropDown';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary-950 text-primary-50 sticky top-0 z-10">
        <section className="max-4-4xl mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl w-auto font-medium flex justify-start">
            <a
              href="#todo-list"
              className="whitespace-normal sm:whitespace-nowrap ml-3 mr-5"
            >
              TODO-LIST
            </a>
          </h1>
          <ProfileDropdown />
        </section>
      </header>
      <main className=" max-w-screen max-h-screen mx-auto"></main>
    </div>
  );
}
